package com.devarena.service;

import com.devarena.models.*;
import com.devarena.repositories.IContestRepo;
import com.devarena.repositories.IQuestionRepo;
import com.devarena.repositories.ISubmissionRepo;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@Transactional
public class SubmissionService {

    private final LocalCppRunnerService runner;
    private final IContestRepo contestRepo;
    private final IQuestionRepo questionRepo;
    private final ISubmissionRepo submissionRepo;

    public SubmissionService(
            LocalCppRunnerService runner,
            IContestRepo contestRepo,
            IQuestionRepo questionRepo,
            ISubmissionRepo submissionRepo
    ) {
        this.runner = runner;
        this.contestRepo = contestRepo;
        this.questionRepo = questionRepo;
        this.submissionRepo = submissionRepo;
    }

    public Map<String, Object> submit(
            UUID contestId,
            UUID questionId,
            Map<String, Object> body,
            User user
    ) {

        // Extract & validate input

        Object codeObj = body.get("code");
        if (!(codeObj instanceof String)) {
            throw new RuntimeException("Invalid code format");
        }
        String code = (String) codeObj;


        @SuppressWarnings("unchecked")
        List<String> inputs = (List<String>) body.get("testcases");

        if (code == null || inputs == null || inputs.isEmpty()) {
            throw new RuntimeException("Missing code or testcases");
        }

        // Load question 

        Question question = questionRepo.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Question not found"));

        // Contest validation 

        if (contestId != null) {
            Contest contest = contestRepo.findById(contestId)
                    .orElseThrow(() -> new RuntimeException("Contest not found"));

//            if (contest.getStatus() != ContestStatus.LIVE) {
//                throw new RuntimeException("Contest not live");
//            }

            if (!contest.getQuestions().contains(question)) {
                throw new RuntimeException("Question not in contest");
            }
        }


        Submission submission = new Submission();
        submission.setUserId(user.getUserId());
        submission.setContestId(contestId);   //contestid is nullale
        submission.setQuestionId(questionId);
        submission.setCode(code);
        submission.setSubmittedAt(LocalDateTime.now());
        submission.setVerdict(Verdict.PENDING);
        submission.setScore(0);

        submissionRepo.save(submission);


        List<LocalCppRunnerService.Result> results =
                runner.executeBatch(code, inputs);


        List<Testcase> allTestcases = new java.util.ArrayList<>();
        allTestcases.addAll(question.getSampleTestcases());
        allTestcases.addAll(question.getHiddenTestcases());


        Verdict verdict = Verdict.ACCEPTED;

        for (int i = 0; i < results.size(); i++) {

            LocalCppRunnerService.Result r = results.get(i);

            if (r.stderr != null && !r.stderr.isBlank()) {
                verdict = mapErrorToVerdict(r.stderr);
                break;
            }

            String actual = r.stdout == null ? "" : r.stdout.trim();
            String expected = allTestcases.get(i).getOutput().trim();

            if (!actual.equals(expected)) {
                verdict = Verdict.WRONG_ANSWER;
                break;
            }
        }


        submission.setVerdict(verdict);

        if (verdict == Verdict.ACCEPTED) {
            submission.setScore(
                    question.getScore() != null ? question.getScore() : 100
            );
        }

        submissionRepo.save(submission);


        return Map.of(
                "verdict", verdict,
                "score", submission.getScore()
        );
    }

    private Verdict mapErrorToVerdict(String error) {
        error = error.toLowerCase();

        if (error.contains("time")) return Verdict.TIME_LIMIT_EXCEEDED;
        if (error.contains("memory")) return Verdict.RUNTIME_ERROR;
        if (error.contains("runtime")) return Verdict.RUNTIME_ERROR;

        return Verdict.WRONG_ANSWER;
    }

    public List<Submission> getSubmissions(
            UUID questionId,
            UUID contestId,
            User user
    ) {
        if (contestId == null) {
            return submissionRepo
                    .findByUserIdAndQuestionIdOrderBySubmittedAtDesc(
                            user.getUserId(),
                            questionId
                    );
        }

        return submissionRepo
                .findByUserIdAndContestIdAndQuestionIdOrderBySubmittedAtDesc(
                        user.getUserId(),
                        contestId,
                        questionId
                );
    }
}

