package com.devarena.compiler_service.service;

import org.springframework.stereotype.Service;

import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
public class LocalCppRunnerService {

    private static final long MEMORY_LIMIT_BYTES = 256L * 1024 * 1024;
    private static final int COMPILE_TIMEOUT_SECONDS = 10;
    private static final int RUN_TIMEOUT_SECONDS = 5;

    public List<Result> executeBatch(String code, List<String> testcases) {

        List<Result> results = new ArrayList<>();

        String containerName = "cpp-runner-" + System.nanoTime();

        try {

            /* START RUNNER CONTAINER */

            Process startContainer = new ProcessBuilder(
                    "docker", "run", "-dit",
                    "--rm",
                    "--name", containerName,
                    "--cpus=1",
                    "--memory=256m",
                    "--pids-limit=64",
                    "--network=none",
                    "--tmpfs", "/work:exec,size=64m",
                    "--security-opt=no-new-privileges",
                    "--cap-drop=ALL",
                    "evaraste/gpp-runner",
                    "bash"
            ).start();

            boolean started = startContainer.waitFor(10, TimeUnit.SECONDS);

            if (!started || startContainer.exitValue() != 0) {
                results.add(new Result("", "Failed to start runner container"));
                return results;
            }

            /* WAIT FOR CONTAINER TO BE READY */

            boolean ready = false;
            for (int attempt = 0; attempt < 10; attempt++) {
                Process ping = new ProcessBuilder(
                        "docker", "exec", containerName, "true"
                ).start();
                if (ping.waitFor(2, TimeUnit.SECONDS) && ping.exitValue() == 0) {
                    ready = true;
                    break;
                }
                Thread.sleep(200);
            }

            if (!ready) {
                results.add(new Result("", "Container did not become ready in time"));
                return results;
            }

            /* COMPILE: pipe code via stdin to avoid docker cp race condition */

            Process compile = new ProcessBuilder(
                    "docker", "exec", "-i", containerName,
                    "bash", "-c",
                    "cat > /work/code.cpp && g++ /work/code.cpp -O2 -std=c++17 -o /work/app 2>&1"
            ).start();

            // Write source code into the container via stdin
            try (OutputStream os = compile.getOutputStream()) {
                os.write(code.getBytes(StandardCharsets.UTF_8));
            }

            boolean compiled = compile.waitFor(COMPILE_TIMEOUT_SECONDS, TimeUnit.SECONDS);

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
                    results.add(new Result("", compileOutput.trim()));
                }
                return results;
            }

            /* RUN TESTCASES */

            for (String input : testcases) {

                Process run = new ProcessBuilder(
                        "docker", "exec", "-i",
                        containerName,
                        "bash", "-c",
                        "cd /work && timeout --signal=SIGKILL 1s ./app"
                ).start();

                // Write test input to stdin
                try (OutputStream os = run.getOutputStream()) {
                    os.write(input.getBytes(StandardCharsets.UTF_8));
                }

                // Read stdout and stderr BEFORE waitFor to prevent pipe buffer deadlock
                byte[] stdoutBytes = run.getInputStream().readAllBytes();
                byte[] stderrBytes = run.getErrorStream().readAllBytes();

                boolean finished = run.waitFor(RUN_TIMEOUT_SECONDS, TimeUnit.SECONDS);

                if (!finished) {
                    run.destroyForcibly();
                    results.add(new Result("", "Time Limit Exceeded"));
                    continue;
                }

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
                    String stderr = new String(stderrBytes, StandardCharsets.UTF_8).trim();
                    results.add(new Result("", stderr.isEmpty() ? "Runtime Error" : stderr));
                }
                else {
                    String stdout = new String(stdoutBytes, StandardCharsets.UTF_8).trim();
                    String stderr = new String(stderrBytes, StandardCharsets.UTF_8).trim();
                    results.add(new Result(stdout, stderr));
                }
            }

        }
        catch (Exception e) {
            results.clear();
            results.add(new Result("", "Execution error: " + e.getMessage()));
        }
        finally {
            try {
                new ProcessBuilder(
                        "docker", "rm", "-f", containerName
                ).start().waitFor();
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

            p.waitFor(2, TimeUnit.SECONDS);

            String output = new String(
                    p.getInputStream().readAllBytes(),
                    StandardCharsets.UTF_8
            ).trim();

            return Long.parseLong(output);
        }
        catch (Exception e) {
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

        public String getStdout() { return stdout; }
        public String getStderr() { return stderr; }
        public void setStdout(String stdout) { this.stdout = stdout; }
        public void setStderr(String stderr) { this.stderr = stderr; }
    }
}