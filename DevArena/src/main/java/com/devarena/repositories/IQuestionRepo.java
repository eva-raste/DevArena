package com.devarena.repositories;

import com.devarena.models.Question;
import com.devarena.models.QuestionOrigin;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface IQuestionRepo extends JpaRepository<Question, UUID> {

    boolean existsByQuestionSlug(String questionSlug);

    Question findByQuestionSlug(String slug);

    List<Question> findAllByQuestionSlugIn(List<String> questionSlugs);

    Optional<Question> findByQuestionSlugAndOrigin(String slug, QuestionOrigin origin);

    boolean existsByQuestionSlugAndOrigin(String questionSlug, QuestionOrigin origin);
}
