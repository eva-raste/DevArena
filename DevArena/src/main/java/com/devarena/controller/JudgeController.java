package com.devarena.controller;

import com.devarena.service.LocalCppRunnerService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api")
public class JudgeController {

    private final LocalCppRunnerService runner;

    public JudgeController(LocalCppRunnerService runner) {
        this.runner = runner;
    }

    @PostMapping("/run")
    public ResponseEntity<?> run(@RequestBody Map<String, String> body) {

        String code = body.get("code");
        String stdin = body.get("stdin");

        if (code == null)
            return ResponseEntity.badRequest().body("Missing code");

        LocalCppRunnerService.Result result = runner.execute(code, stdin == null ? "" : stdin);

        return ResponseEntity.ok(Map.of(
                "stdout", result.stdout,
                "stderr", result.stderr
        ));
    }
}
