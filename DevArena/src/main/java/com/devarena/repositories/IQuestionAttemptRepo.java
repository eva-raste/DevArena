package com.devarena.repositories;

import com.devarena.models.ContestParticipation;
import com.devarena.models.Question;
import com.devarena.models.QuestionAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface IQuestionAttemptRepo  extends JpaRepository<QuestionAttempt, UUID> {
    Optional<QuestionAttempt> findByParticipationAndQuestion(
            ContestParticipation participation,
            Question question
    );

        @Query("""
        SELECT qa
        FROM QuestionAttempt qa
        JOIN qa.participation p
        WHERE p.contest.contestId = :contestId
          AND p.user.userId IN :userIds
    """)
        List<QuestionAttempt> findAllForLeaderboardPage(
                @Param("contestId") UUID contestId,
                @Param("userIds") List<UUID> userIds
        );

    List<QuestionAttempt> findByParticipationId(UUID id);
}

