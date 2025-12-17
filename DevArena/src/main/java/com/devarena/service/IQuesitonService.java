package com.devarena.service;


import com.devarena.dtos.QuestionCreateDto;
import com.devarena.dtos.QuestionDto;


public interface IQuesitonService {
    public QuestionCreateDto createQuestion(QuestionCreateDto q);

    public Iterable<QuestionDto> getAllQuestions();

    boolean existsByQuestionSlug(String questionSlug);

    public QuestionDto findByQuestionSlug(String slug);
}
