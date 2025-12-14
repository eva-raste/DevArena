package com.devarena.service;

import org.springframework.stereotype.Service;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

@Service
public class LocalCppRunnerService {

    public Result execute(String code, String stdin) {
        Result result = new Result();

        try {
            // Temp directory
            Path tempDir = Files.createTempDirectory("cpp");
            Path codeFile = tempDir.resolve("code.cpp");
            Files.writeString(codeFile, code);

            // STEP 1 — Compile
            Process compile = new ProcessBuilder(
                    "docker", "run", "--rm",
                    "-v", tempDir.toString() + ":/usr/src/myapp",
                    "-w", "/usr/src/myapp",
                    "gpp-runner",
                    "g++", "code.cpp", "-o", "app"
            ).start();

            compile.waitFor();
            String compileErr = new String(compile.getErrorStream().readAllBytes());

            if (!compileErr.isEmpty()) {
                result.stderr = compileErr;
                return result;
            }

            // STEP 2 — Run the executable
            Process run = new ProcessBuilder(
                    "docker", "run", "--rm",
                    "-v", tempDir.toString() + ":/usr/src/myapp",
                    "-w", "/usr/src/myapp",
                    "gpp-runner",
                    "./app"
            ).start();

            // Pass STDIN to program
            if (!stdin.isEmpty()) {
                run.getOutputStream().write(stdin.getBytes());
                run.getOutputStream().flush();
            }
            run.getOutputStream().close();

            String stdout = new String(run.getInputStream().readAllBytes());
            String stderr = new String(run.getErrorStream().readAllBytes());
            run.waitFor();

            result.stdout = stdout;
            result.stderr = stderr;

        } catch (Exception e) {
            result.stderr = "Execution error: " + e.getMessage();
        }

        return result;
    }

    public static class Result {
        public String stdout = "";
        public String stderr = "";
    }
}
