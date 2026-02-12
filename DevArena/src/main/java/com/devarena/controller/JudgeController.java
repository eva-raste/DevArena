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

        String scope = (roomId == null || roomId.isBlank())
                ? "global"
                : "contest:" + roomId;

        String draftKey = String.format(
                "draft:%s:%s:%s:%s",
                user.getUserId(),
                scope,
                questionSlug,
                language
        );

        long now = System.currentTimeMillis();

        Map<String, Object> value = Map.of(
                "code", code,
                "updatedAt", now
        );

        // Save actual draft
        redisTemplate.opsForValue()
                .set(draftKey,
                        objectMapper.writeValueAsString(value),
                        Duration.ofHours(24));

        // Update index key (O(1) lookup pointer)
        // This points to the MOST RECENT draft for this question+language
        String indexKey = String.format(
                "draft:index:%s:%s:%s",
                user.getUserId(),
                questionSlug,
                language
        );

        Map<String, Object> indexValue = Map.of(
                "draftKey", draftKey,
                "updatedAt", now,
                "scope", scope
        );

        redisTemplate.opsForValue()
                .set(indexKey,
                        objectMapper.writeValueAsString(indexValue),
                        Duration.ofHours(24));
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
            Map<String, Object> value = objectMapper.readValue(raw, new TypeReference<>() {
            });
            return Map.of("code", (String) value.get("code"));
        }

        // OUTSIDE CONTEST
        // Use index for O(1) lookup of most recent draft
        String indexKey = String.format(
                "draft:index:%s:%s:%s",
                user.getUserId(),
                questionSlug,
                language
        );

        String indexRaw = redisTemplate.opsForValue().get(indexKey);

        // No drafts exist at all → return empty (frontend shows template)
        if (indexRaw == null) {
            return Map.of();
        }

        Map<String, Object> index =
                objectMapper.readValue(indexRaw, new TypeReference<>() {
                });

        String draftKey = (String) index.get("draftKey");
        if (draftKey == null) {
            return Map.of();
        }

        // Fetch the actual draft
        String draftRaw = redisTemplate.opsForValue().get(draftKey);
        if (draftRaw == null) {
            return Map.of();
        }

        Map<String, Object> draft =
                objectMapper.readValue(draftRaw, new TypeReference<>() {
                });

        return Map.of("code", (String) draft.get("code"));
    }
}