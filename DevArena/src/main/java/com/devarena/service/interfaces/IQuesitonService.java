package com.devarena.service.interfaces;


import com.devarena.dtos.QuestionCardDto;
import com.devarena.dtos.QuestionCreateDto;
import com.devarena.dtos.QuestionDto;
import com.devarena.models.User;
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;


public interface IQuesitonService {
    public QuestionCreateDto createQuestion(QuestionCreateDto q, User owner);

    public QuestionDto findByQuestionSlug(String slug);

    QuestionCardDto getCardByQuestionSlug(String slug, User owner);

    boolean existsByQuestionSlug(@NotBlank String questionSlug);

    List<QuestionDto> getAllQuestionsByUser(User owner);

    QuestionDto updateQuestion(QuestionDto dto);

    boolean deleteQuestion(UUID id);

    Page<QuestionDto> getAllQuestions(Pageable pageable,User owner);

}
