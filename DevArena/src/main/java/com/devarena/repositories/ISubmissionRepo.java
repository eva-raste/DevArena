package com.devarena.repositories;

import com.devarena.models.Submission;
import com.devarena.models.Verdict;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

public interface ISubmissionRepo extends JpaRepository<Submission, UUID> {
    // Practice submissions
    List<Submission> findByUserIdAndQuestionIdOrderBySubmittedAtDesc(
            UUID userId,
            UUID questionId
    );

    // Contest submissions
    List<Submission> findByUserIdAndContestIdAndQuestionIdOrderBySubmittedAtDesc(
            UUID userId,
            UUID contestId,
            UUID questionId
    );

    List<Submission> findByUserIdAndContestIdAndVerdict(
            UUID userId,
            UUID contestId,
            Verdict verdict
    );
}
