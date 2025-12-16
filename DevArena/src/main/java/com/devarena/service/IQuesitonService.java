package com.devarena.service;


import com.devarena.dtos.QuestionCreateDto;


public interface IQuesitonService {
    public QuestionCreateDto createQuestion(QuestionCreateDto q);

    public Iterable<QuestionCreateDto> getAllQuestions();

    boolean existsByQuestionSlug(String questionSlug);
}
