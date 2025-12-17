package com.devarena.repositories;

import com.devarena.models.Question;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface IQuestionRepo extends JpaRepository<Question, UUID> {

    boolean existsByQuestionSlug(String questionSlug);

    Question findByQuestionSlug(String slug);
}
