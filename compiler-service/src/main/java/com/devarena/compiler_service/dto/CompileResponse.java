package com.devarena.compiler_service.dto;

import java.util.List;

public class CompileResponse {

    private List<Result> results;

    public CompileResponse() {}

    public CompileResponse(List<Result> results) {
        this.results = results;
    }

    public List<Result> getResults() {
        return results;
    }

    public void setResults(List<Result> results) {
        this.results = results;
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