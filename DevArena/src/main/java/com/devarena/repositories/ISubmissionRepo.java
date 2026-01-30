package com.devarena.repositories;

import com.devarena.models.QuestionDifficulty;
import com.devarena.models.Submission;
import com.devarena.models.User;
import com.devarena.models.Verdict;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

public interface ISubmissionRepo extends JpaRepository<Submission, UUID> {
    // Practice submissions
//    List<Submission> findByUserIdAndQuestionIdOrderBySubmittedAtDesc(
//            UUID userId,
//            UUID questionId
//    );

    // Contest submissions
//    List<Submission> findByUserIdAndContestIdAndQuestionIdOrderBySubmittedAtDesc(
//            UUID userId,
//            UUID contestId,
//            UUID questionId
//    );

    List<Submission> findByUserIdAndRoomIdAndVerdict(
            UUID userId,
            String roomId,
            Verdict verdict
    );

    long countByUserId(UUID userId);

    // contests attended (rule B)
    @Query("""
        SELECT COUNT(DISTINCT s.roomId)
        FROM Submission s
        WHERE s.userId = :userId
    """)
    long countDistinctContests(UUID userId);

    // total solved (unique triple)
    @Query("""
        SELECT COUNT(DISTINCT s.userId, s.roomId, s.questionSlug)
        FROM Submission s
        WHERE s.userId = :userId AND s.verdict = 'ACCEPTED'
    """)
    long countSolved(UUID userId);

    // solved by difficulty
    @Query("""
        SELECT COUNT(DISTINCT s.userId, s.roomId, s.questionSlug)
        FROM Submission s
        JOIN Question q ON q.questionSlug = s.questionSlug
        WHERE s.userId = :userId
          AND s.verdict = 'ACCEPTED'
          AND q.difficulty = :difficulty
    """)
    long countSolvedByDifficulty(UUID userId, QuestionDifficulty difficulty);

    // recent submissions
    Page<Submission> findByUserIdOrderBySubmittedAtDesc(
            UUID userId,
            Pageable pageable
    );

    // monthly solved
    @Query("""
        SELECT YEAR(s.submittedAt), MONTH(s.submittedAt),
               COUNT(DISTINCT s.userId, s.roomId, s.questionSlug)
        FROM Submission s
        WHERE s.userId = :userId AND s.verdict = 'ACCEPTED'
        GROUP BY YEAR(s.submittedAt), MONTH(s.submittedAt)
        ORDER BY YEAR(s.submittedAt), MONTH(s.submittedAt)
    """)
    List<Object[]> monthlySolved(UUID userId);

    List<Submission> findByUserIdAndQuestionSlugOrderBySubmittedAtDesc(
            UUID userId,
            String questionSlug
    );


    List<Submission> findByUserIdAndRoomIdAndQuestionSlugOrderBySubmittedAtDesc(
            UUID userId,
            String roomId,
            String questionSlug
    );
}
