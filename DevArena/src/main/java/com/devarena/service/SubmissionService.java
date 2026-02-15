package com.devarena.service;

import com.devarena.dtos.questions.Testcase;
import com.devarena.models.*;
import com.devarena.repositories.IContestRepo;
import com.devarena.repositories.IQuestionRepo;
import com.devarena.repositories.ISubmissionRepo;
import com.devarena.service.interfaces.ISubmissionService;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.*;

@Service
@Transactional
public class SubmissionService implements ISubmissionService {

    private final LocalCppRunnerService runner;
    private final IContestRepo contestRepo;
    private final IQuestionRepo questionRepo;
    private final ISubmissionRepo submissionRepo;
    private final ContestEventPublisher eventPublisher;

    public SubmissionService(
            LocalCppRunnerService runner,
            IContestRepo contestRepo,
            IQuestionRepo questionRepo,
            ISubmissionRepo submissionRepo,
            ContestEventPublisher eventPublisher
    ) {
        this.runner = runner;
        this.contestRepo = contestRepo;
        this.questionRepo = questionRepo;
        this.submissionRepo = submissionRepo;
        this.eventPublisher=eventPublisher;
    }

    public Map<String, Object> run(Map<String, Object> body) {

        String code = (String) body.get("code");

        @SuppressWarnings("unchecked")
        List<String> testcases = (List<String>) body.get("testcases");
        System.out.println(testcases);
        if (code == null || testcases == null) {
            throw new IllegalArgumentException("Missing code or testcases");
        }

        List<LocalCppRunnerService.Result> results =
                runner.executeBatch(code, testcases);

        return Map.of("results", results);
    }

    public Map<String, Object> submit(
            String roomId,
            String questionSlug,
           String code,
            User user
    ) {

        if (code == null) {
            throw new RuntimeException("Missing code or testcases");
        }

        // Load question 

        Question question = questionRepo.findByQuestionSlug(questionSlug)
                .orElseThrow(() -> new RuntimeException("Question not found"));

        // Contest validation 
        Contest contest = null;
        if (roomId != null) {
            contest = contestRepo.findByRoomIdAndDeletedFalse(roomId)
                    .orElseThrow(() -> new RuntimeException("Contest not found"));

//            if (contest.getStatus() != ContestStatus.LIVE) {
//                throw new RuntimeException("Contest not live");
//            }

            boolean exists = contest.getContestQuestions()
                    .stream()
                    .anyMatch(cq -> cq.getQuestion().getQuestionId()
                            .equals(question.getQuestionId()));

            if (!exists) {
                throw new RuntimeException("Question not in contest");
            }

        }

//        System.out.println("submission " + roomId + " " + questionSlug);
        Submission submission = new Submission();
        submission.setUserId(user.getUserId());
        submission.setRoomId(roomId);   //contestid is nullale
        submission.setQuestionSlug(questionSlug);
        submission.setCode(code);
        submission.setSubmittedAt(LocalDateTime.now());
        submission.setVerdict(Verdict.PENDING);
        submission.setScore(0);

        submissionRepo.save(submission);

        List<String> inputs = new ArrayList<>(question.getSampleTestcases()
                .stream().map(Testcase::getInput).toList());

        inputs.addAll(question.getHiddenTestcases()
                .stream().map(Testcase::getInput).toList());
//        System.out.println("inputs : " + inputs);
//        System.out.println(question.getHiddenTestcases());

        List<LocalCppRunnerService.Result> results =
                runner.executeBatch(code, inputs);


        List<Testcase> allTestcases = new java.util.ArrayList<>();
        allTestcases.addAll(question.getSampleTestcases());
        allTestcases.addAll(question.getHiddenTestcases());


        Verdict verdict = Verdict.ACCEPTED;
        int passed = 0;

        for (int i = 0; i < results.size(); i++) {
            LocalCppRunnerService.Result r = results.get(i);

            if (r.stderr != null && !r.stderr.isBlank()) {
//                System.out.println("result " + r.stderr);

                verdict = mapErrorToVerdict(r.stderr);
                break;
            }

            String actual = r.stdout == null ? "" : r.stdout.trim();
            String expected = allTestcases.get(i).getOutput().trim();

            if (actual.equals(expected)) {
                passed++;
            } else {
                verdict = Verdict.WRONG_ANSWER;
                break;
            }
        }


        submission.setVerdict(verdict);
        assert contest != null;
        int score = contest.getContestQuestions()
                .stream().filter(cq -> cq.getQuestion().getQuestionId()
                        .equals(question.getQuestionId())
                )
                .map(ContestQuestion::getScore).findFirst()
                .orElseThrow(()-> new ResponseStatusException(HttpStatus.NOT_FOUND, "Score not found"));


        if (verdict == Verdict.ACCEPTED) {
            submission.setScore(score);
        }

//        eventPublisher.publishSubmissionResult(
//                contest.getRoomId(),
//                question.getQuestionSlug(),
//                user.getUserId(),
//                verdict,
//                submission.getScore()
//        );


        submissionRepo.save(submission);


        return Map.of(
                "verdict", verdict,
                "passed", passed,
                "total", results.size(),
                "score", submission.getScore()
        );

    }

    private Verdict mapErrorToVerdict(String error) {
        error = error.toLowerCase();
        System.out.println(error);
        if (error.contains("time")) return Verdict.TIME_LIMIT_EXCEEDED;
        if (error.contains("memory")) return Verdict.RUNTIME_ERROR;
        if (error.contains("runtime")) return Verdict.RUNTIME_ERROR;

        return Verdict.WRONG_ANSWER;
    }

    public List<Submission> getSubmissions(
            String questionSlug,
            String roomId,
            User user
    ) {
        if (roomId == null) {
            return submissionRepo
                    .findByUserIdAndQuestionSlugOrderBySubmittedAtDesc(
                            user.getUserId(),
                            questionSlug
                    );
        }

        return submissionRepo
                .findByUserIdAndRoomIdAndQuestionSlugOrderBySubmittedAtDesc(
                        user.getUserId(),
                        roomId,
                        questionSlug
                );
    }

    public int getMyTotalScore(UUID userId, String roomId) {

        List<Submission> accepted =
                submissionRepo.findByUserIdAndRoomIdAndVerdict(
                        userId,
                        roomId,
                        Verdict.ACCEPTED
                );

        Map<String, Integer> bestScorePerQuestion = new HashMap<>();

        for (Submission s : accepted) {
            bestScorePerQuestion.putIfAbsent(
                    s.getQuestionSlug(),
                    s.getScore()
            );
        }

        return bestScorePerQuestion.values()
                .stream()
                .mapToInt(Integer::intValue)
                .sum();
    }


    public List<String> getAcceptedQuestionSlugs(UUID userId, String roomId) {

        return submissionRepo
                .findByUserIdAndRoomIdAndVerdict(
                        userId,
                        roomId,
                        Verdict.ACCEPTED
                )
                .stream()
                .map(Submission::getQuestionSlug)
                .distinct()
                .toList();
    }
}

