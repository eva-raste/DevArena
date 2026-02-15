package com.devarena.repositories;

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

    List<Question> findAllByOwner(User owner);

    Optional<Question> findByQuestionSlugAndOwner(
            String slug
            , User owner);

//    Optional<Question> findByQuestionSlugAndDeletedFalse(String questionSlug);

    Page<Question> findAllByDeletedFalseAndOwner(User owner, Pageable pageable);

    Optional<Question> findByQuestionSlugAndOwnerAndDeletedFalse(String slug, User owner);

    List<Question> findAllByOwnerAndDeletedFalse(User owner);

    Page<Question> findAllByOwnerAndDeletedFalse(User owner, Pageable pageable);

    Page<Question> findAllByOwnerAndDifficultyAndDeletedFalse(User owner, QuestionDifficulty difficulty, Pageable pageable);

    long countByDifficultyAndDeletedFalse(QuestionDifficulty difficulty);


    Optional<Question> findByQuestionSlugAndDeletedFalse(String slug);

    Optional<Question> findByQuestionSlugAndOwnerOrModifiersContainingAndDeletedFalse(
            String slug,
            User owner,
            User modifier
    );



    @Query("""
    SELECT q FROM Question q
    LEFT JOIN q.modifiers m
    WHERE (q.owner.userId = :userId OR m.userId = :userId)
    AND (:difficulty IS NULL OR q.difficulty = :difficulty)
""")
    Page<Question> findAllAccessibleByUser(
            @Param("userId") UUID userId,
            @Param("difficulty") QuestionDifficulty difficulty,
            Pageable pageable
    );



    Question findByQuestionSlugAndModifiersContains(String slug, User user);
}
