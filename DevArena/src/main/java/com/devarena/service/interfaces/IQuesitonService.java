package com.devarena.service.interfaces;


import com.devarena.dtos.questions.QuestionCardDto;
import com.devarena.dtos.questions.QuestionCreateDto;
import com.devarena.dtos.questions.QuestionDto;
import com.devarena.dtos.users.UserVerifyDto;
import com.devarena.models.QuestionDifficulty;
import com.devarena.models.User;
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;


public interface IQuesitonService {
    public QuestionCreateDto createQuestion(QuestionCreateDto q, User owner);

    public QuestionDto findByQuestionSlug(String slug,User currentUser);

    QuestionCardDto getCardByQuestionSlug(String slug, User owner);

    boolean existsByQuestionSlug(@NotBlank String questionSlug);

    List<QuestionDto> getAllQuestionsByUser(User owner);

    QuestionDto updateQuestion(String slug, QuestionDto dto, User currentUser);


//    Page<QuestionDto> getAllQuestions(Pageable pageable, User owner, QuestionDifficulty diff);

    public QuestionDto findByQuestionSlugAndDeletedFalse(String slug);

    boolean deleteQuestion(
            String slug,
            User currentUser
    );

    UserVerifyDto verifyUserByEmail(String email);

    void updateModifiers(String slug, List<UUID> modifierIds, User currentUser);

    Page<QuestionDto> getAllQuestions(Pageable pageable, UUID userId, QuestionDifficulty difficulty);
    QuestionCardDto fetchContestQuestion(String questionSlug, String roomId, User user);

    QuestionDto findByQuestionSlugAndModifier(String slug, User user);
}
