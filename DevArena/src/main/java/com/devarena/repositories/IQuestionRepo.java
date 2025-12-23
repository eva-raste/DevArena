package com.devarena.repositories;

import com.devarena.dtos.QuestionDto;
import com.devarena.models.Question;
import com.devarena.models.QuestionOrigin;
import com.devarena.models.User;
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

    List<QuestionDto> findAllByOwner(User owner);
}
