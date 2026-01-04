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

    public List<Result> executeBatch(String code, List<String> testcases) {
        List<Result> results = new ArrayList<>();

        try {
            //COMPILE ONCE

            Path tempDir = Files.createTempDirectory("cpp");
            Path codeFile = tempDir.resolve("code.cpp");
            Files.writeString(codeFile, code, StandardCharsets.UTF_8);

            Process compile = new ProcessBuilder(
                    "docker", "run", "--rm",
                    "-v", tempDir.toAbsolutePath() + ":/usr/src/myapp",
                    "-w", "/usr/src/myapp",
                    "gpp-runner",
                    "g++", "code.cpp", "-O2", "-std=c++17", "-o", "app"
            ).redirectErrorStream(true).start();

            compile.waitFor(10, TimeUnit.SECONDS);

            String compileOut = new String(
                    compile.getInputStream().readAllBytes(),
                    StandardCharsets.UTF_8
            );

            if (compile.exitValue() != 0) {
                for (int i = 0; i < testcases.size(); i++) {
                    results.add(new Result("", compileOut));
                }
                return results;
            }

            //RUN BINARY PER TESTCASE

            for (String stdin : testcases) {

                if (!stdin.endsWith("\n"))
                    stdin += "\n";

                Process run = new ProcessBuilder(
                        "docker", "run", "--rm", "-i",
                        "-v", tempDir.toAbsolutePath() + ":/usr/src/myapp",
                        "-w", "/usr/src/myapp",
                        "gpp-runner",
                        "./app"
                ).start();

                try (OutputStream os = run.getOutputStream()) {
                    os.write(stdin.getBytes(StandardCharsets.UTF_8));
                    os.flush();
                }

                run.waitFor(5, TimeUnit.SECONDS);

                String stdout = new String(
                        run.getInputStream().readAllBytes(),
                        StandardCharsets.UTF_8
                );
                String stderr = new String(
                        run.getErrorStream().readAllBytes(),
                        StandardCharsets.UTF_8
                );

                results.add(new Result(stdout, stderr));
            }

        } catch (Exception e) {
            results.clear();
            results.add(new Result("", "Execution error: " + e.getMessage()));
        }

        return results;
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
