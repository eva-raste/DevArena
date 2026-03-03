package com.devarena.compiler_service.controller;

import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@AllArgsConstructor
@RequestMapping("/api/health")
public class HealthController {

    @GetMapping
    public ResponseEntity<?> getHealth()
    {
        return ResponseEntity.ok("Server is up...");
    }
}