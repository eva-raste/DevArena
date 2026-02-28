package com.devarena.service;

import com.devarena.dtos.compiler.CompileRequest;
import com.devarena.dtos.compiler.CompileResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Service
public class CompilerClient {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${compiler.url}")
    private String compilerUrl;

    @Value("${compiler.secret}")
    private String secret;

    public List<CompileResponse.Result> execute(String code, List<String> inputs) {

        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Internal-Token", secret);
        headers.setContentType(MediaType.APPLICATION_JSON);

        CompileRequest request = new CompileRequest(code, inputs);

        HttpEntity<CompileRequest> entity =
                new HttpEntity<>(request, headers);

        ResponseEntity<CompileResponse> response =
                restTemplate.postForEntity(
                        compilerUrl + "/internal/compile",
                        entity,
                        CompileResponse.class
                );

        return response.getBody().getResults();
    }
}