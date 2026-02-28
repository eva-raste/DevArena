package com.devarena.dtos.compiler;

import java.util.List;

public class CompileResponse {

    private List<Result> results;

    public CompileResponse() {}

    public List<Result> getResults() { return results; }
    public void setResults(List<Result> results) { this.results = results; }

    public static class Result {
        public String stdout;
        public String stderr;
    }
}