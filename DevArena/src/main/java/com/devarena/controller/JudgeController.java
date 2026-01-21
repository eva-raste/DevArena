package com.devarena.controller;

import com.devarena.models.*;
import com.devarena.repositories.IContestRepo;
import com.devarena.repositories.IQuestionRepo;
import com.devarena.repositories.ISubmissionRepo;
import com.devarena.service.LocalCppRunnerService;
import com.devarena.service.SubmissionService;
import jakarta.transaction.Transactional;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api")
public class JudgeController {

    private final LocalCppRunnerService runner;
    private final IContestRepo contestRepo;
    private final IQuestionRepo questionRepo;
    private final ISubmissionRepo submissionRepo;
    private final SubmissionService submissionService;

    public JudgeController(
            LocalCppRunnerService runner,
            IContestRepo contestRepo,
            IQuestionRepo questionRepo,
            ISubmissionRepo submissionRepo,
            SubmissionService submissionService
    ) {
        this.submissionService = submissionService;
        this.runner = runner;
        this.contestRepo = contestRepo;
        this.questionRepo = questionRepo;
        this.submissionRepo = submissionRepo;
    }

    @GetMapping("/contests/{contestId}/my-score")
    public ResponseEntity<?> myScore(
            @PathVariable UUID contestId,
            @AuthenticationPrincipal User user
    ) {
        Map<UUID, Integer> bestScorePerQuestion = new HashMap<>();

        List<Submission> accepted =
                submissionRepo.findByUserIdAndContestIdAndVerdict(
                        user.getUserId(),
                        contestId,
                        Verdict.ACCEPTED
                );

        for (Submission s : accepted) {
            bestScorePerQuestion.putIfAbsent(
                    s.getQuestionId(),
                    s.getScore()
            );
        }

        int total = bestScorePerQuestion.values()
                .stream()
                .mapToInt(Integer::intValue)
                .sum();

        return ResponseEntity.ok(Map.of("totalScore", total));
    }


    @GetMapping("/contests/{contestId}/accepted-questions")
    public ResponseEntity<?> acceptedQuestions(
            @PathVariable UUID contestId,
            @AuthenticationPrincipal User user
    ) {
        List<UUID> acceptedQuestionIds =
                submissionRepo
                        .findByUserIdAndContestIdAndVerdict(
                                user.getUserId(),
                                contestId,
                                Verdict.ACCEPTED
                        )
                        .stream()
                        .map(Submission::getQuestionId)
                        .distinct()
                        .toList();

        return ResponseEntity.ok(acceptedQuestionIds);
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

    @PostMapping("/questions/{questionId}/submit")
    public ResponseEntity<?> submit(
            @PathVariable UUID questionId,
            @RequestParam(required = false) UUID contestId,
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(
                submissionService.submit(contestId, questionId, body, user)
        );
    }


    @GetMapping("/questions/{questionId}/submissions")
    public ResponseEntity<?> submissions(
            @PathVariable UUID questionId,
            @RequestParam(required = false) UUID contestId,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(
                submissionService.getSubmissions(
                        questionId,
                        contestId,
                        user
                )
        );
    }


}
