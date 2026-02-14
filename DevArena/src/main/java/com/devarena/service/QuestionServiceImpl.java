package com.devarena.service;

import com.devarena.dtos.questions.QuestionCardDto;
import com.devarena.dtos.questions.QuestionCreateDto;
import com.devarena.dtos.questions.QuestionDto;
import com.devarena.dtos.questions.Testcase;
import com.devarena.dtos.users.UserVerifyDto;
import com.devarena.exception.testcases.TestcaseApiException;
import com.devarena.exception.testcases.TestcaseErrorCode;
import com.devarena.models.Question;
import com.devarena.models.QuestionDifficulty;
import com.devarena.models.User;
import com.devarena.repositories.IQuestionRepo;
import com.devarena.repositories.UserRepository;
import com.devarena.service.interfaces.IQuesitonService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.Data;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Service
@Data
public class QuestionServiceImpl implements IQuesitonService {

    private final UserRepository userRepo;

    private final IQuestionRepo questionRepo;
    private final ModelMapper modelMapper;
    @Transactional
    @Override
    public QuestionCreateDto createQuestion(
            QuestionCreateDto dto,
            User owner
    ) {

        Question newquestion = modelMapper.map(dto, Question.class);

        validateTestcases(newquestion.getHiddenTestcases());
        validateTestcases(newquestion.getSampleTestcases());

        newquestion.setOwner(owner);

        if (dto.getModifierIds() != null && !dto.getModifierIds().isEmpty()) {
            List<User> users = userRepo.findAllById(dto.getModifierIds());
            newquestion.getModifiers().addAll(users);
        }

        newquestion.getModifiers().add(owner);

        questionRepo.save(newquestion);

        return modelMapper.map(newquestion, QuestionCreateDto.class);
    }



    public Page<QuestionDto> getAllQuestions(
            Pageable pageable,
            UUID userId,
            QuestionDifficulty difficulty
    ) {
        Page<Question> page = questionRepo
                .findAllAccessibleByUser(userId, pageable);

        return page.map(q -> {
            QuestionDto dto = modelMapper.map(q, QuestionDto.class);

            if (q.getOwner().getUserId().equals(userId)) {
                dto.setRole("OWNER");
            } else {
                dto.setRole("MODIFIER");
            }

            return dto;
        });
    }



    @Override
    public boolean existsByQuestionSlug(String questionSlug) {
        return questionRepo.existsByQuestionSlug(questionSlug);
    }

//    @Override
//    public QuestionDto findByQuestionSlug(String slug) {
//        return modelMapper.map(questionRepo.findByQuestionSlug(slug),QuestionDto.class);
//
//    }

    @Override
    public QuestionDto findByQuestionSlugAndDeletedFalse(String slug) {
        return modelMapper.map(questionRepo.findByQuestionSlugAndDeletedFalse(slug),QuestionDto.class);

    }

    @Override
    public QuestionDto findByQuestionSlug(String slug, User currentUser) {

        Question question = questionRepo
                .findByQuestionSlugAndDeletedFalse(slug)
                .orElseThrow(() -> new EntityNotFoundException("Question not found"));

        boolean isOwner = question.getOwner().getUserId()
                .equals(currentUser.getUserId());

        boolean isModifier = question.getModifiers().stream()
                .anyMatch(u -> u.getUserId().equals(currentUser.getUserId()));

        if (!isOwner && !isModifier) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "NO_ACCESS"
            );
        }

        QuestionDto dto = modelMapper.map(question, QuestionDto.class);

        if (isOwner) {
            dto.setRole("OWNER");
        } else {
            dto.setRole("MODIFIER");
        }

        return dto;
    }

    @Override
    public QuestionCardDto getCardByQuestionSlug(
            String slug,
            User currentUser
    ) {
        Question question = questionRepo
                .findByQuestionSlugAndDeletedFalse(slug)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Question not found"
                ));

        boolean isOwner = question.getOwner()
                .getUserId()
                .equals(currentUser.getUserId());

        boolean isModifier = question.getModifiers()
                .stream()
                .anyMatch(u -> u.getUserId()
                        .equals(currentUser.getUserId()));

        if (!isOwner && !isModifier) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "NO_ACCESS"
            );
        }

        return modelMapper.map(question, QuestionCardDto.class);
    }



    @Override
    public List<QuestionDto> getAllQuestionsByUser(User owner) {
        List<Question> qu = questionRepo.findAllByOwnerAndDeletedFalse(owner);
        return qu.stream().map(
                q -> modelMapper.map(q,QuestionDto.class)
        ).toList();
    }

    @Transactional
    @Override
    public QuestionDto updateQuestion(String slug, QuestionDto dto, User currentUser) {

        Question question = questionRepo
                .findByQuestionSlugAndDeletedFalse(slug)
                .orElseThrow(() -> new EntityNotFoundException("Question not found"));

        boolean isOwner = question.getOwner().getUserId()
                .equals(currentUser.getUserId());

        boolean isModifier = question.getModifiers().stream()
                .anyMatch(u -> u.getUserId().equals(currentUser.getUserId()));

        if (!isOwner && !isModifier) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "NO_EDIT_PERMISSION"
            );
        }

        if(!Objects.equals(slug, dto.getQuestionSlug()) && questionRepo.existsByQuestionSlug(dto.getQuestionSlug()))
        {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "QUESTION_SLUG_ALREADY_EXISTS"
            );

        }
        question.setQuestionSlug(dto.getQuestionSlug());
        question.setTitle(dto.getTitle());
        question.setDescription(dto.getDescription());
        question.setDifficulty(dto.getDifficulty());
        question.setScore(dto.getScore());
        question.setConstraints(dto.getConstraints());

        // validate testcases first
        validateTestcases(dto.getHiddenTestcases());
        validateTestcases(dto.getSampleTestcases());

        question.getSampleTestcases().clear();
        question.getSampleTestcases().addAll(dto.getSampleTestcases());

        question.getHiddenTestcases().clear();
        question.getHiddenTestcases().addAll(dto.getHiddenTestcases());

        return modelMapper.map(question, QuestionDto.class);
    }


    @Transactional
    @Override
    public boolean deleteQuestion(
            String slug,
            User currentUser
    ) {
        Question question = questionRepo
                .findByQuestionSlug(slug)
                .orElseThrow(() -> new EntityNotFoundException("Question not found"));

        if (!question.getOwner().getUserId()
                .equals(currentUser.getUserId())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "ONLY_OWNER_CAN_DELETE"
            );
        }

        question.setDeleted(true);
        return true;
    }



    private void validateTestcases(List<Testcase> testcases) {

        if (testcases == null || testcases.isEmpty()) {
            throw new TestcaseApiException(
                    TestcaseErrorCode.TESTCASE_VALIDATION_FAILED,
                    "Testcases cannot be empty"
            );
        }

        // Enforce deterministic order
        testcases.sort(Comparator.comparingInt(Testcase::getOrder));

        for (int i = 0; i < testcases.size(); i++) {
            if (testcases.get(i).getOrder() != i + 1) {
                throw new TestcaseApiException(
                        TestcaseErrorCode.TESTCASE_VALIDATION_FAILED,
                        "Testcase order must be continuous starting from 1"
                );
            }
        }

        final int MAX_INPUT_SIZE = 50_000;
        final int MAX_OUTPUT_SIZE = 10_000;

        for (Testcase tc : testcases) {

            if (tc.getInput() == null || tc.getInput().isBlank()) {
                throw new TestcaseApiException(
                        TestcaseErrorCode.TESTCASE_VALIDATION_FAILED,
                        "Testcase input cannot be empty"
                );
            }

            if (tc.getOutput() == null || tc.getOutput().isBlank()) {
                throw new TestcaseApiException(
                        TestcaseErrorCode.TESTCASE_VALIDATION_FAILED,
                        "Testcase output cannot be empty"
                );
            }

            if (tc.getInput().length() > MAX_INPUT_SIZE) {
                throw new TestcaseApiException(
                        TestcaseErrorCode.TESTCASE_VALIDATION_FAILED,
                        "Testcase input too large"
                );
            }

            if (tc.getOutput().length() > MAX_OUTPUT_SIZE) {
                throw new TestcaseApiException(
                        TestcaseErrorCode.TESTCASE_VALIDATION_FAILED,
                        "Testcase output too large"
                );
            }
        }
    }

    public UserVerifyDto verifyUserByEmail(String email) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "USER_NOT_FOUND"
                ));

        return modelMapper.map(user, UserVerifyDto.class);
    }

    @Transactional
    public void updateModifiers(
            String slug,
            List<UUID> modifierIds,
            User currentUser
    ) {
        Question question = questionRepo
                .findByQuestionSlugAndDeletedFalse(slug)
                .orElseThrow(() -> new EntityNotFoundException("Question not found"));

        // ONLY OWNER CAN MODIFY MODIFIERS
        if (!question.getOwner().getUserId().equals(currentUser.getUserId())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "ONLY_OWNER_CAN_MANAGE_MODIFIERS"
            );
        }

        List<User> users = userRepo.findAllById(modifierIds);
        System.out.println(users);
        question.getModifiers().clear();
        question.getModifiers().add(question.getOwner()); // always include owner
        question.getModifiers().addAll(users);

        questionRepo.save(question);
    }

}
