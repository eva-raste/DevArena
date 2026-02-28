package com.devarena.dtos.compiler;

import java.util.List;

public class CompileRequest {

    private String code;
    private List<String> inputs;

    public CompileRequest() {}

    public CompileRequest(String code, List<String> inputs) {
        this.code = code;
        this.inputs = inputs;
    }

    public String getCode() { return code; }
    public List<String> getInputs() { return inputs; }

    public void setCode(String code) { this.code = code; }
    public void setInputs(List<String> inputs) { this.inputs = inputs; }
}