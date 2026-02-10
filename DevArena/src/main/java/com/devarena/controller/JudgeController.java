package com.devarena.controller;

import com.devarena.models.*;
import com.devarena.repositories.IContestRepo;
import com.devarena.repositories.IQuestionRepo;
import com.devarena.repositories.ISubmissionRepo;
import com.devarena.service.LocalCppRunnerService;
import com.devarena.service.SubmissionService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class JudgeController {

    private final SubmissionService submissionService;
    private final RedisTemplate<String, String> redisTemplate;
    private final ObjectMapper objectMapper;


    @GetMapping("/contests/{roomId}/my-score")
    public ResponseEntity<?> myScore(
            @PathVariable String roomId,
            @AuthenticationPrincipal User user
    ) {
        int totalScore = submissionService.getMyTotalScore(user.getUserId(), roomId);
        return ResponseEntity.ok(Map.of("totalScore", totalScore));
    }


    @GetMapping("/contests/{roomId}/accepted-questions")
    public ResponseEntity<?> acceptedQuestions(
            @PathVariable String roomId,
            @AuthenticationPrincipal User user
    ) {
        List<String> acceptedQuestionSlugs =
                submissionService.getAcceptedQuestionSlugs(user.getUserId(), roomId);

        return ResponseEntity.ok(acceptedQuestionSlugs);
    }


    @PostMapping("/run")
    public ResponseEntity<?> runBatch(@RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(submissionService.run(body));
    }


    @PostMapping("/questions/{questionSlug}/submit")
    public ResponseEntity<?> submit(
            @PathVariable String questionSlug,
            @RequestParam(required = false) String roomId,
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(
                submissionService.submit(roomId, questionSlug, body, user)
        );
    }


    @GetMapping("/questions/{questionSlug}/submissions")
    public ResponseEntity<?> submissions(
            @PathVariable String questionSlug,
            @RequestParam(required = false) String roomId,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(
                submissionService.getSubmissions(
                        questionSlug,
                        roomId,
                        user
                )
        );
    }

    @PostMapping("/drafts")
    public void saveDraft(
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal User user
    ) throws JsonProcessingException {
        if (user == null) return;

        String questionSlug = body.get("questionSlug");
        String language = body.get("language");
        String code = body.get("code");
        String roomId = body.get("roomId");

        String scope = (roomId == null || roomId.isBlank()) ? "global" : "contest:" + roomId;
        String key = String.format(
                "draft:%s:%s:%s:%s",
                user.getUserId(),
                scope,
                questionSlug,
                language
        );

        Map<String, Object> value = Map.of(
                "code", code,
                "updatedAt", System.currentTimeMillis()
        );

        redisTemplate.opsForValue()
                .set(key, objectMapper.writeValueAsString(value), Duration.ofHours(24));
    }

    @GetMapping("/drafts")
    public Map<String, String> getDraft(
            @RequestParam String questionSlug,
            @RequestParam String language,
            @RequestParam(required = false) String roomId,
            @AuthenticationPrincipal User user
    ) throws JsonProcessingException {
        if (user == null) return Map.of();

        // CASE 1: INSIDE CONTEST
        if (roomId != null && !roomId.isBlank()) {
            String contestKey = String.format(
                    "draft:%s:contest:%s:%s:%s",
                    user.getUserId(),
                    roomId,
                    questionSlug,
                    language
            );

            String raw = redisTemplate.opsForValue().get(contestKey);

            // First time in this contest → return empty (frontend shows template)
            if (raw == null) {
                return Map.of();
            }

            // Return saved contest code
            Map<String, Object> value = objectMapper.readValue(raw, new TypeReference<>() {});
            return Map.of("code", (String) value.get("code"));
        }

        // CASE 2: OUTSIDE CONTEST
        String pattern = String.format(
                "draft:%s:*:%s:%s",
                user.getUserId(),
                questionSlug,
                language
        );

        Set<String> keys = redisTemplate.keys(pattern);
        if (keys == null || keys.isEmpty()) {
            return Map.of(); // No drafts found → return empty
        }

        Map<String, Object> mostRecentContest = null;
        Map<String, Object> globalDraft = null;
        long mostRecentContestTime = -1;
        long globalTime = -1;

        for (String key : keys) {
            String raw = redisTemplate.opsForValue().get(key);
            if (raw == null) continue;

            Map<String, Object> v = objectMapper.readValue(raw, new TypeReference<>() {});
            Object ts = v.get("updatedAt");
            if (ts == null) continue;

            long timestamp = ((Number) ts).longValue();

            if (key.contains(":contest:")) {
                // Track the most recent contest draft
                if (timestamp > mostRecentContestTime) {
                    mostRecentContestTime = timestamp;
                    mostRecentContest = v;
                }
            } else if (key.contains(":global:")) {
                globalTime = timestamp;
                globalDraft = v;
            }
        }

        // 1. If no drafts at all → return empty
        if (globalDraft == null && mostRecentContest == null) {
            return Map.of();
        }

        // 2. If only global exists → return global
        if (mostRecentContest == null) {
            return Map.of("code", (String) globalDraft.get("code"));
        }

        // 3. If only contest exists → return most recent contest
        if (globalDraft == null) {
            return Map.of("code", (String) mostRecentContest.get("code"));
        }

        // 4. Both exist → return the NEWER one
        if (globalTime > mostRecentContestTime) {
            return Map.of("code", (String) globalDraft.get("code"));
        } else {
            return Map.of("code", (String) mostRecentContest.get("code"));
        }
    }
}
