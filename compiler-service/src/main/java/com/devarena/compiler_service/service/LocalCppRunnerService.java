package com.devarena.compiler_service.service;

import org.springframework.stereotype.Service;

import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
public class LocalCppRunnerService {

    private static final long MEMORY_LIMIT_BYTES = 256L * 1024 * 1024; // 256MB

    public List<Result> executeBatch(String code, List<String> testcases) {

        List<Result> results = new ArrayList<>();
        String containerName = "cpp-runner-" + System.nanoTime();
        Path tempDir = null;

        try {
            tempDir = Files.createTempDirectory("cpp");
            Files.writeString(tempDir.resolve("code.cpp"), code, StandardCharsets.UTF_8);

            // Start container
            new ProcessBuilder(
                    "docker", "run", "-dit",
                    "--name", containerName,
                    "-v", tempDir.toAbsolutePath() + ":/work",
                    "-w", "/work",
                    "--cpus=1",
                    "--memory=256m",
                    "--pids-limit=64",
                    "--network=none",
                    "gpp-runner",
                    "bash"
            ).start().waitFor();

            // Compile
            Process compile = new ProcessBuilder(
                    "docker", "exec", containerName,
                    "g++", "code.cpp", "-O2", "-std=c++17", "-o", "app"
            ).redirectErrorStream(true).start();

            boolean compiled = compile.waitFor(10, TimeUnit.SECONDS);

            if (!compiled) {
                compile.destroyForcibly();
                results.add(new Result("", "Compilation Timeout"));
                return results;
            }

            String compileOutput = new String(
                    compile.getInputStream().readAllBytes(),
                    StandardCharsets.UTF_8
            );

            if (compile.exitValue() != 0) {
                for (int i = 0; i < testcases.size(); i++) {
                    results.add(new Result("", compileOutput));
                }
                return results;
            }

            // Execute testcases
            for (String input : testcases) {

                Process run = new ProcessBuilder(
                        "docker", "exec", "-i",
                        containerName,
                        "timeout", "--signal=SIGKILL", "1s",
                        "./app"
                ).start();

                try (OutputStream os = run.getOutputStream()) {
                    os.write(input.getBytes(StandardCharsets.UTF_8));
                    os.flush();
                }

                run.waitFor();
                int exitCode = run.exitValue();

                long memoryUsed = readContainerMemory(containerName);

                if (exitCode == 124) {
                    results.add(new Result("", "Time Limit Exceeded"));
                }
                else if (exitCode == 137) {
                    if (memoryUsed >= MEMORY_LIMIT_BYTES) {
                        results.add(new Result("", "Memory Limit Exceeded"));
                    } else {
                        results.add(new Result("", "Time Limit Exceeded"));
                    }
                }
                else if (exitCode != 0) {
                    results.add(new Result("", "Runtime Error"));
                }
                else {
                    String stdout = new String(
                            run.getInputStream().readAllBytes(),
                            StandardCharsets.UTF_8
                    );

                    String stderr = new String(
                            run.getErrorStream().readAllBytes(),
                            StandardCharsets.UTF_8
                    );

                    results.add(new Result(stdout.trim(), stderr.trim()));
                }
            }

        } catch (Exception e) {
            results.clear();
            results.add(new Result("", "Execution error: " + e.getMessage()));
        } finally {

            try {
                new ProcessBuilder("docker", "rm", "-f", containerName)
                        .start().waitFor();
            } catch (Exception ignored) {}

            if (tempDir != null) {
                try {
                    Files.walk(tempDir)
                            .sorted((a, b) -> b.compareTo(a))
                            .forEach(path -> {
                                try { Files.delete(path); }
                                catch (Exception ignored) {}
                            });
                } catch (Exception ignored) {}
            }
        }

        return results;
    }

    private long readContainerMemory(String containerName) {
        try {
            Process p = new ProcessBuilder(
                    "docker", "exec", containerName,
                    "cat", "/sys/fs/cgroup/memory.current"
            ).start();

            p.waitFor();

            String output = new String(
                    p.getInputStream().readAllBytes(),
                    StandardCharsets.UTF_8
            ).trim();

            return Long.parseLong(output);

        } catch (Exception e) {
            return 0;
        }
    }

    public static class Result {
        private String stdout;
        private String stderr;

        public Result() {}

        public Result(String stdout, String stderr) {
            this.stdout = stdout;
            this.stderr = stderr;
        }

        public String getStdout() {
            return stdout;
        }

        public String getStderr() {
            return stderr;
        }

        public void setStdout(String stdout) {
            this.stdout = stdout;
        }

        public void setStderr(String stderr) {
            this.stderr = stderr;
        }
    }
}