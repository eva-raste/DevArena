package com.devarena.repositories;

import com.devarena.models.ContestQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface IContestQuestionRepo extends JpaRepository<ContestQuestion, UUID> {

    @Query("""
    SELECT cq.score
    FROM ContestQuestion cq
    WHERE cq.contest.contestId = :contestId
      AND cq.question.questionId = :questionId
""")
    Integer findScoreByContestAndQuestion(
            @Param("contestId") UUID contestId,
            @Param("questionId") UUID questionId
    );
}
