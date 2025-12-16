package com.devarena.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.*;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api")
public class HomeController {

    @GetMapping("/hello")
    public String sayHello() {
        return "Welcome to DevArena 🚀";
    }

    @PostMapping("/problem/{slug}")
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

        RestTemplate restTemplate = new RestTemplate();
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                entity,
                new ParameterizedTypeReference<Map<String, Object>>() {}
        );

        return ResponseEntity.ok(response.getBody());
    }

    @Value("${OPENROUTER_API_KEY}")
    private String openRouterKey;

    @PostMapping("/ai/generate")
    public ResponseEntity<Map<String, Object>> generateMain(@RequestBody Map<String, String> payload) {
        String description = payload.get("description");
        String functionSignature = payload.get("function");

        String prompt = """
    You are a strict C++ code generator.
    Your task: Generate ONLY the main() function for the given problem.
    
    Rules:
    1️ Output only one C++ function: `int main() { ... }`
    2️ Do NOT include any other code, explanation, or class.
    3️ Use `cin` for input and `cout` for output.
    4️ Follow input/output format from the problem description.
    5️ Inside main(), call the function from this signature exactly once.
    
    Problem description:
    %s
    
    Function signature:
    %s
    """.formatted(description, functionSignature);

        Map<String, Object> response = new HashMap<>();

        try {
            String mainCode = callAI(prompt);

            mainCode = mainCode.replace("```cpp", "")
                    .replace("```", "")
                    .trim();

            response.put("mainFunction", mainCode);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("error", "Failed to generate main(): " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    private String callAI(String prompt) throws Exception {
        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://openrouter.ai/api/v1/chat/completions"))
                .header("Authorization", "Bearer " + openRouterKey)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString("""
            {
                "model": "gpt-4o-mini",
                "messages": [
                    {"role": "system", "content": "You are a C++ compiler helper. Output only clean code."},
                    {"role": "user", "content": "%s"}
                ]
            }
            """.formatted(prompt)))
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        ObjectMapper mapper = new ObjectMapper();
        Map<String, Object> json = mapper.readValue(response.body(), new TypeReference<>() {});
        List<Map<String, Object>> choices = (List<Map<String, Object>>) json.get("choices");
        if (choices != null && !choices.isEmpty()) {
            Map<String, Object> msg = (Map<String, Object>) choices.get(0).get("message");
            return msg.get("content").toString().trim();
        }
        throw new RuntimeException("Invalid AI response");
    }
}
