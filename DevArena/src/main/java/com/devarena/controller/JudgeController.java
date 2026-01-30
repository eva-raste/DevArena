package com.devarena.controller;

import com.devarena.models.*;
import com.devarena.repositories.IContestRepo;
import com.devarena.repositories.IQuestionRepo;
import com.devarena.repositories.ISubmissionRepo;
import com.devarena.service.LocalCppRunnerService;
import com.devarena.service.SubmissionService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class JudgeController {

    private final SubmissionService submissionService;


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


}
