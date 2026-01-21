//package com.devarena.service;
//
//import com.devarena.dtos.judge0.Judge0Request;
//import com.devarena.dtos.judge0.Judge0Response;
//import org.springframework.http.*;
//import org.springframework.stereotype.Service;
//import org.springframework.web.client.RestTemplate;
//
//@Service
//public class Judge0Service {
//
//    private static final String JUDGE0_URL =
//            "http://localhost:3000/submissions?base64_encoded=false&wait=true";
//
//    private final RestTemplate restTemplate = new RestTemplate();
//
//    public Judge0Response execute(String code, String stdin) {
//
//        Judge0Request req = new Judge0Request(54, code, stdin);
//
//        HttpHeaders headers = new HttpHeaders();
//        headers.setContentType(MediaType.APPLICATION_JSON);
//
//        HttpEntity<Judge0Request> entity = new HttpEntity<>(req, headers);
//
//        ResponseEntity<Judge0Response> response =
//                restTemplate.exchange(JUDGE0_URL, HttpMethod.POST, entity, Judge0Response.class);
//
//        return response.getBody();
//    }
//}
