package com.devarena.controller;

import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.HashMap;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
public class HomeController {

    @GetMapping("/hello")
    public String sayHello() {
        return "Welcome to DevArena 🚀";
    }

    @PostMapping("/api/problem/{slug}")
    public ResponseEntity<Map<String, Object>> getProblem(@PathVariable String slug) {
        String url = "https://leetcode.com/graphql";

        String query = """
    query getQuestion($titleSlug: String!) {
        question(titleSlug: $titleSlug) {
            title
            content
            codeSnippets {
                lang
                code
            }
        }
    }
    """;

        Map<String, Object> body = new HashMap<>();
        body.put("query", query);
        Map<String, String> variables = new HashMap<>();
        variables.put("titleSlug", slug);
        body.put("variables", variables);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        RestTemplate restTemplate = new RestTemplate();
        ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                entity,
                new ParameterizedTypeReference<Map<String, Object>>() {}
        );

        return ResponseEntity.ok(response.getBody());
    }

}
