package com.devarena.service.interfaces;


import com.devarena.dtos.QuestionCardDto;
import com.devarena.dtos.QuestionCreateDto;
import com.devarena.dtos.QuestionDto;
import com.devarena.models.User;
import jakarta.validation.constraints.NotBlank;

import java.util.List;


public interface IQuesitonService {
    public QuestionCreateDto createQuestion(QuestionCreateDto q, User owner);

    public Iterable<QuestionDto> getAllQuestions();

    public QuestionDto findByQuestionSlug(String slug);

    QuestionCardDto getCardByQuestionSlug(String slug, User owner);

    boolean existsByQuestionSlug(@NotBlank String questionSlug);

    List<QuestionDto> getAllQuestionsByUser(User owner);
}
