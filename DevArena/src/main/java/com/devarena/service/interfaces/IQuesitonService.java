package com.devarena.service.interfaces;


import com.devarena.dtos.QuestionCardDto;
import com.devarena.dtos.QuestionCreateDto;
import com.devarena.dtos.QuestionDto;
import com.devarena.models.QuestionOrigin;
import com.devarena.models.User;
import jakarta.validation.constraints.NotBlank;


public interface IQuesitonService {
    public QuestionCreateDto createQuestion(QuestionCreateDto q, User owner);

    public Iterable<QuestionDto> getAllQuestions();

    boolean existsByQuestionSlug(String questionSlug);

    public QuestionDto findByQuestionSlug(String slug);

    QuestionCardDto getCardByQuestionSlug(String slug, QuestionOrigin questionOrigin);

    boolean existsByQuestionSlugAndOrigin(@NotBlank String questionSlug, QuestionOrigin own);
}
