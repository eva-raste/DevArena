package com.devarena.repositories;

import com.devarena.dtos.questions.QuestionCardDto;
import com.devarena.dtos.questions.QuestionDto;
import com.devarena.dtos.questions.Testcase;
import com.devarena.models.Question;
import com.devarena.models.QuestionDifficulty;
import com.devarena.models.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface IQuestionRepo extends JpaRepository<Question, UUID> {

    boolean existsByQuestionSlug(String questionSlug);


    List<Question> findAllByQuestionSlugIn(List<String> questionSlugs);

    Optional<Question> findByQuestionSlug(String slug);

    List<Question> findAllByOwnerAndDeletedFalse(User owner);


    long countByDifficultyAndDeletedFalse(QuestionDifficulty difficulty);


    Optional<Question> findByQuestionSlugAndDeletedFalse(String slug);

    @Query("""
    SELECT DISTINCT q FROM Question q
    LEFT JOIN q.modifiers m
    WHERE q.deleted = false
    AND (
        q.owner.userId = :userId
        OR m.userId = :userId
    )
    AND (:difficulty IS NULL OR q.difficulty = :difficulty)
""")
    Page<Question> findAllAccessibleByUser(
            @Param("userId") UUID userId,
            @Param("difficulty") QuestionDifficulty difficulty,
            Pageable pageable
    );

    @Query("""
        SELECT new com.devarena.dtos.questions.QuestionCardDto(
            q.questionSlug,
            q.title,
            q.description,
            q.difficulty,
            q.constraints
        )
        FROM Question q
        LEFT JOIN q.modifiers m
        WHERE q.deleted = false
        AND (
            q.owner.userId = :userId
            OR m.userId = :userId
        )
        AND (:difficulty IS NULL OR q.difficulty = :difficulty)
        """)
    Page<QuestionCardDto> findAllAccessibleProjected(
            @Param("userId") UUID userId,
            @Param("difficulty") QuestionDifficulty difficulty,
            Pageable pageable
    );

    @Query("""
        SELECT m.email
        FROM Question q
        JOIN q.modifiers m
        WHERE q.questionSlug = :slug
        AND q.deleted = false
        """)
    List<String> findModifierEmailsBySlug(@Param("slug") String slug);

    @Query("""
    SELECT t
    FROM Question q
    JOIN q.sampleTestcases t
    WHERE q.questionSlug = :slug
""")
    List<Testcase> findSampleTestcasesBySlug(@Param("slug") String slug);

    @Query("""
    SELECT t
    FROM Question q
    JOIN q.hiddenTestcases t
    WHERE q.questionSlug = :slug
""")
    List<Testcase> findHiddenTestcasesBySlug(@Param("slug") String slug);

    @Query("""
        SELECT new com.devarena.dtos.questions.QuestionDto(
            q.questionSlug,
            q.title,
            q.description,
            q.difficulty,
            q.constraints
        )
        FROM Question q
        WHERE q.questionSlug = :slug
        AND q.deleted = false
        """)
    Optional<QuestionDto> findQuestionDtoBySlug(@Param("slug") String slug);

    @Query("""
        SELECT COUNT(q) > 0
        FROM Question q
        WHERE q.questionSlug = :slug
        AND q.owner.userId = :userId
        """)
    boolean existsByQuestionSlugAndOwnerUserId(
            @Param("slug") String slug,
            @Param("userId") UUID userId
    );

    @Query("""
    SELECT q
    FROM Question q
    WHERE q.questionSlug = :slug
    AND q.deleted = false
    AND (
        q.owner.userId = :userId
        OR EXISTS (
            SELECT 1
            FROM q.modifiers m
            WHERE m.userId = :userId
        )
    )
""")
    Optional<Question> findAccessibleBySlug(
            @Param("slug") String slug,
            @Param("userId") UUID userId
    );

}
