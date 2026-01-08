package com.devarena.service;

import org.springframework.stereotype.Service;

import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
public class LocalCppRunnerService {

    private static final long MEMORY_LIMIT_BYTES = 256L * 1024 * 1024; // 256MB

    public List<Result> executeBatch(String code, List<String> testcases) {
        List<Result> results = new ArrayList<>();
        String containerName = "cpp-runner-" + System.nanoTime();

        try {
            Path tempDir = Files.createTempDirectory("cpp");
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

            compile.waitFor(10, TimeUnit.SECONDS);

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
                    String stdout = new String(run.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
                    String stderr = new String(run.getErrorStream().readAllBytes(), StandardCharsets.UTF_8);
                    results.add(new Result(stdout.trim(), stderr.trim()));
                }
            }

        } catch (Exception e) {
            results.clear();
            results.add(new Result("", "Execution error: " + e.getMessage()));
        } finally {
            try {
                new ProcessBuilder("docker", "rm", "-f", containerName).start();
            } catch (Exception ignored) {}
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
            String output = new String(p.getInputStream().readAllBytes(), StandardCharsets.UTF_8).trim();
            return Long.parseLong(output);
        } catch (Exception e) {
            return 0;
        }
    }

    public static class Result {
        public String stdout;
        public String stderr;

        public Result(String stdout, String stderr) {
            this.stdout = stdout;
            this.stderr = stderr;
        }
    }
}
