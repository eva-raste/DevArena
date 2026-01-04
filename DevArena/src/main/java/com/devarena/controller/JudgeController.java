package com.devarena.controller;

import com.devarena.service.LocalCppRunnerService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
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
    public ResponseEntity<?> runBatch(@RequestBody Map<String, Object> body) {

        String code = (String) body.get("code");
        @SuppressWarnings("unchecked")
        List<String> testcases = (List<String>) body.get("testcases");

        if (code == null || testcases == null)
            return ResponseEntity.badRequest().body("Missing code or testcases");

        List<LocalCppRunnerService.Result> results =
                runner.executeBatch(code, testcases);

        return ResponseEntity.ok(Map.of("results", results));
    }

}
