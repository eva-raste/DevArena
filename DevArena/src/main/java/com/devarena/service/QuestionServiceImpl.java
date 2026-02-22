package com.devarena.service;

import com.devarena.dtos.questions.QuestionCardDto;
import com.devarena.dtos.questions.QuestionCreateDto;
import com.devarena.dtos.questions.QuestionDto;
import com.devarena.dtos.questions.Testcase;
import com.devarena.dtos.users.UserVerifyDto;
import com.devarena.exception.testcases.TestcaseApiException;
import com.devarena.exception.testcases.TestcaseErrorCode;
import com.devarena.models.*;
import com.devarena.repositories.IQuestionRepo;
import com.devarena.repositories.UserRepository;
import com.devarena.service.interfaces.IQuesitonService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.Data;
import org.modelmapper.ModelMapper;
import org.springframework.data.crossstore.ChangeSetPersister;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;

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
        newquestion.setModifiers(new ArrayList<>());

        validateTestcases(newquestion.getHiddenTestcases());
        validateTestcases(newquestion.getSampleTestcases());

        newquestion.setOwner(owner);

        if (dto.getModifiers() != null && !dto.getModifiers().isEmpty()) {
            List<User> users = userRepo.findAllByEmailIn(dto.getModifiers());

            if (users.size() != dto.getModifiers().size()) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "ONE_OR_MORE_USERS_NOT_FOUND"
                );
            }

            List<User> filteredUsers = users.stream()
                    .filter(u -> !u.getUserId().equals(owner.getUserId()))
                    .toList();

            newquestion.getModifiers().addAll(filteredUsers);
        }

        questionRepo.save(newquestion);

        return modelMapper.map(newquestion, QuestionCreateDto.class);
    }



    public Page<QuestionDto> getAllQuestions(
            Pageable pageable,
            UUID userId,
            QuestionDifficulty difficulty
    ) {
        Page<Question> page = questionRepo
                .findAllAccessibleByUser(userId,difficulty, pageable);

        return page.map(q -> {
            QuestionDto dto = modelMapper.map(q, QuestionDto.class);

            dto.setRole(resolveRole(q, userRepo.findById(userId).orElseThrow()));
            dto.setModifiers(extractModifierEmails(q));

            return dto;
        });
    }



    @Override
    public boolean existsByQuestionSlug(String questionSlug) {
        return questionRepo.existsByQuestionSlug(questionSlug);
    }

    @Override
    public QuestionDto findByQuestionSlugAndDeletedFalse(String slug) {
        return modelMapper.map(questionRepo.findByQuestionSlugAndDeletedFalse(slug),QuestionDto.class);

    }

    @Override
    public QuestionDto findByQuestionSlug(String slug, User currentUser) {

        Question question = questionRepo
                .findByQuestionSlugAndDeletedFalse(slug)
                .orElseThrow(() -> new EntityNotFoundException("Question not found"));

        String role = resolveRole(question, currentUser);

        if (role == null) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "NO_ACCESS"
            );
        }

        QuestionDto dto = modelMapper.map(question, QuestionDto.class);
        dto.setRole(role);
        dto.setModifiers(extractModifierEmails(question));

        System.out.println("Owner ID: " + question.getOwner().getUserId());
        System.out.println("CurrentUser ID: " + currentUser.getUserId());

        return dto;
    }
    public QuestionCardDto fetchContestQuestion(String questionSlug, String roomId, User user) {
        Question ques = questionRepo.findByQuestionSlug(questionSlug)
                .orElseThrow(() -> new EntityNotFoundException("Question not found"));

        ContestQuestion contestQuestion = ques.getContestQuestions()
                .stream()
                .filter(cq -> Objects.equals(
                        cq.getContest().getRoomId(),
                        roomId
                ))
                .findFirst()
                .orElse(null);

        if (contestQuestion == null) {
            throw new RuntimeException("Question not part of contest...");
        }

        Contest contest = contestQuestion.getContest();



        if(contest == null)
        {
            throw new RuntimeException("Question not part of contest...");
        }

        if (contest.getStatus() == ContestStatus.SCHEDULED) {
            throw new RuntimeException("Contest not started");
        }

        if (contest.getVisibility() == ContestVisibility.PRIVATE && contest.getStatus() == ContestStatus.ENDED) {
            // TODO : do that when we keep functionality of registration in contest. then for LIVE also check registered or not
            // if contests is private and ended, then only attendees can access it...
            if (!contest.getAttendees().contains(user)) {
                throw new RuntimeException("Not allowed");
            }
        }


        return modelMapper.map(ques,QuestionCardDto.class);
    }

    @Override
    public QuestionDto findByQuestionSlugAndModifier(String slug, User user) {
        Question ques = questionRepo.findByQuestionSlugAndModifiersContains(slug,user);

        if(ques == null)
        {
            throw new EntityNotFoundException("Question not found");
        }

        String role = resolveRole(ques, user);
        System.out.println("role from findByQuestionSlugAndModifier "+ role);
        if (role == null) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "NO_ACCESS"
            );
        }

        QuestionDto dto = modelMapper.map(ques, QuestionDto.class);
        dto.setRole(role);
        dto.setModifiers(extractModifierEmails(ques));

        return dto;
//        QuestionDto dto = modelMapper.map(ques, QuestionDto.class);
//
//        List<String> modifierEmails = ques.getModifiers()
//                .stream()
//                .map(User::getEmail)
//                .toList();
//
//        dto.setModifiers(modifierEmails);
//        System.out.println(dto.getRole());
//        return dto;

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

        QuestionCardDto dto = modelMapper.map(question, QuestionCardDto.class);

        dto.setModifiers(extractModifierEmails(question));
        System.out.println("from getCardByQuestionSlug ");
        return dto;
    }



    @Override
    public List<QuestionDto> getAllQuestionsByUser(User owner) {
        List<Question> qu = questionRepo.findAllByOwnerAndDeletedFalse(owner);
        return qu.stream().map(q -> {
            QuestionDto dto = modelMapper.map(q, QuestionDto.class);

            dto.setRole("OWNER");
            dto.setModifiers(extractModifierEmails(q));

            return dto;
        }).toList();
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
        question.setConstraints(dto.getConstraints());

        // validate testcases first
        validateTestcases(dto.getHiddenTestcases());
        validateTestcases(dto.getSampleTestcases());

        question.getSampleTestcases().clear();
        question.getSampleTestcases().addAll(dto.getSampleTestcases());

        question.getHiddenTestcases().clear();
        question.getHiddenTestcases().addAll(dto.getHiddenTestcases());
        if (isOwner) {

            question.getModifiers().clear();

            if (dto.getModifiers() != null && !dto.getModifiers().isEmpty()) {

                List<User> users = userRepo.findAllByEmailIn(dto.getModifiers());

                if (users.size() != dto.getModifiers().size()) {
                    throw new ResponseStatusException(
                            HttpStatus.BAD_REQUEST,
                            "ONE_OR_MORE_USERS_NOT_FOUND"
                    );
                }

                // Never add owner into modifier list
                question.getModifiers().addAll(
                        users.stream()
                                .filter(u -> !u.getUserId().equals(question.getOwner().getUserId()))
                                .toList()
                );
            }
        }
        QuestionDto updatedDto = modelMapper.map(question, QuestionDto.class);

        updatedDto.setRole(resolveRole(question, currentUser));
        updatedDto.setModifiers(extractModifierEmails(question));

        return updatedDto;
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


    @Transactional
    public void removeModifier(
            String slug,
            String modifierEmail,
            User currentUser
    ) {

        Question question = questionRepo
                .findByQuestionSlugAndDeletedFalse(slug)
                .orElseThrow(() -> new EntityNotFoundException("Question not found"));

        // Only owner can remove
        if (!question.getOwner().getUserId()
                .equals(currentUser.getUserId())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "ONLY_OWNER_CAN_REMOVE_MODIFIER"
            );
        }

        User modifier = userRepo.findByEmail(modifierEmail)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "USER_NOT_FOUND"
                ));

        // Prevent removing owner
        if (modifier.getUserId().equals(question.getOwner().getUserId())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "OWNER_CANNOT_BE_REMOVED"
            );
        }

        question.getModifiers().removeIf(
                u -> u.getUserId().equals(modifier.getUserId())
        );

        questionRepo.save(question);
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

    private List<String> extractModifierEmails(Question question) {
        return question.getModifiers()
                .stream()
                .filter(u -> !u.getUserId().equals(question.getOwner().getUserId()))
                .map(User::getEmail)
                .toList();
    }

    private String resolveRole(Question question, User currentUser) {
        if (question.getOwner().getUserId().equals(currentUser.getUserId())) {
            return "OWNER";
        }

        boolean isModifier = question.getModifiers()
                .stream()
                .anyMatch(u -> u.getUserId().equals(currentUser.getUserId()));

        if (isModifier) {
            return "MODIFIER";
        }

        return null;
    }


}
