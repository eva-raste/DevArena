package com.devarena.service.interfaces;


import com.devarena.dtos.QuestionCardDto;
import com.devarena.dtos.QuestionCreateDto;
import com.devarena.dtos.QuestionDto;
import com.devarena.models.QuestionOrigin;
import com.devarena.models.User;
import jakarta.validation.constraints.NotBlank;

import java.util.List;


public interface IQuesitonService {
    public QuestionCreateDto createQuestion(QuestionCreateDto q, User owner);

    public Iterable<QuestionDto> getAllQuestions();

    boolean existsByQuestionSlug(String questionSlug);

    public QuestionDto findByQuestionSlug(String slug);

    QuestionCardDto getCardByQuestionSlug(String slug, QuestionOrigin questionOrigin, User owner);

    boolean existsByQuestionSlugAndOrigin(@NotBlank String questionSlug, QuestionOrigin own);

    List<QuestionDto> getAllQuestionsByUser(User owner);
}
