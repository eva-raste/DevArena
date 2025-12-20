package com.devarena.service;


import com.devarena.dtos.QuestionCardDto;
import com.devarena.dtos.QuestionCreateDto;
import com.devarena.dtos.QuestionDto;
import com.devarena.models.QuestionOrigin;


public interface IQuesitonService {
    public QuestionCreateDto createQuestion(QuestionCreateDto q);

    public Iterable<QuestionDto> getAllQuestions();

    boolean existsByQuestionSlug(String questionSlug);

    public QuestionDto findByQuestionSlug(String slug);

    QuestionCardDto getCardByQuestionSlug(String slug, QuestionOrigin questionOrigin);
}
