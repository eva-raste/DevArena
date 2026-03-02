package com.devarena.service;

import com.devarena.dtos.questions.QuestionCardDto;
import com.devarena.dtos.questions.QuestionCreateDto;
import com.devarena.dtos.questions.QuestionDto;
import com.devarena.dtos.questions.Testcase;
import com.devarena.exception.testcases.TestcaseApiException;
import com.devarena.exception.testcases.TestcaseErrorCode;
import com.devarena.models.*;
import com.devarena.repositories.IQuestionRepo;
import com.devarena.repositories.UserRepository;
import com.devarena.service.interfaces.IQuesitonService;
import jakarta.persistence.EntityNotFoundException;
import lombok.Data;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;

@Service
@Data
public class QuestionServiceImpl implements IQuesitonService {

    private final UserRepository userRepo;

    private final IQuestionRepo questionRepo;
    @Transactional
    @Override
    public QuestionCreateDto createQuestion(
            QuestionCreateDto dto,
            User owner
    ) {

        Question newquestion = mapToEntity(dto, owner);        newquestion.setModifiers(new ArrayList<>());

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

        return mapToCreateDto(newquestion);    }


    @Transactional(readOnly = true)
    public Page<QuestionDto> getAllQuestions(
            Pageable pageable,
            UUID userId,
            QuestionDifficulty difficulty
    ) {
        Page<QuestionCardDto> page =
                questionRepo.findAllAccessibleProjected(userId, difficulty, pageable);

        return page.map(card -> toQuestionDtoFromCard(card, userId));
    }

    @Transactional
    @Override
    public boolean existsByQuestionSlug(String questionSlug) {
        return questionRepo.existsByQuestionSlug(questionSlug);
    }

    @Transactional(readOnly = true)
    @Override
    public QuestionDto findByQuestionSlugAndDeletedFalse(String slug) {

        Question question = questionRepo
                .findByQuestionSlugAndDeletedFalse(slug)
                .orElseThrow(() -> new EntityNotFoundException("Question not found"));

        return mapToQuestionDto(question, "OWNER"); // or compute properly
    }

//    @Override
//    public QuestionDto findByQuestionSlug(String slug, User currentUser) {
//
//        Question question = questionRepo
//                .findByQuestionSlugAndDeletedFalse(slug)
//                .orElseThrow(() -> new EntityNotFoundException("Question not found"));
//
//        String role = resolveRole(question, currentUser);
//
//        if (role == null) {
//            throw new ResponseStatusException(
//                    HttpStatus.FORBIDDEN,
//                    "NO_ACCESS"
//            );
//        }
//
//        QuestionDto dto = modelMapper.map(question, QuestionDto.class);
//        dto.setRole(role);
//        dto.setModifiers(extractModifierEmails(question));
//
//        System.out.println("Owner ID: " + question.getOwner().getUserId());
//        System.out.println("CurrentUser ID: " + currentUser.getUserId());
//
//        return dto;
//    }

    @Transactional(readOnly = true)
    public QuestionDto findByQuestionSlug(String slug, User currentUser) {

        QuestionDto dto = questionRepo.findQuestionDtoBySlug(slug)
                .orElseThrow(() -> new EntityNotFoundException("Question not found"));

        List<String> modifiers =
                questionRepo.findModifierEmailsBySlug(slug);

        boolean isOwner = questionRepo.existsByQuestionSlugAndOwnerUserId(slug, currentUser.getUserId());

        boolean isModifier = modifiers.contains(currentUser.getEmail());

        if (!isOwner && !isModifier) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "NO_ACCESS"
            );
        }

        dto.setRole(isOwner ? "OWNER" : "MODIFIER");

        dto.setModifiers(modifiers);

        List<Testcase> sample =
                questionRepo.findSampleTestcasesBySlug(slug);

        List<Testcase> hidden =
                questionRepo.findHiddenTestcasesBySlug(slug);

// Sort safely here
        sample.sort(Comparator.comparingInt(Testcase::getOrder));
        hidden.sort(Comparator.comparingInt(Testcase::getOrder));

        dto.setSampleTestcases(sample);
        dto.setHiddenTestcases(hidden);

        return dto;
    }

    @Transactional(readOnly = true)
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

//        if (contest.getVisibility() == ContestVisibility.PRIVATE && contest.getStatus() == ContestStatus.ENDED) {
//            // TODO : do that when we keep functionality of registration in contest. then for LIVE also check registered or not
//            // if contests is private and ended, then only attendees can access it...
//            if (!contest.getAttendees().contains(user)) {
//                throw new RuntimeException("Not allowed");
//            }
//        }


        return mapToCardDto(ques);
    }

//    @Transactional(readOnly = true)
//    @Override
//    public QuestionDto findByQuestionSlugAndModifier(String slug, User user) {
//        Question ques = questionRepo.findByQuestionSlugAndModifiersContains(slug,user);
//
//        if(ques == null)
//        {
//            throw new EntityNotFoundException("Question not found");
//        }
//
//        String role = resolveRole(ques, user);
//        System.out.println("role from findByQuestionSlugAndModifier "+ role);
//        if (role == null) {
//            throw new ResponseStatusException(
//                    HttpStatus.FORBIDDEN,
//                    "NO_ACCESS"
//            );
//        }
//
//        return mapToQuestionDto(ques, role);
////        QuestionDto dto = modelMapper.map(ques, QuestionDto.class);
////
////        List<String> modifierEmails = ques.getModifiers()
////                .stream()
////                .map(User::getEmail)
////                .toList();
////
////        dto.setModifiers(modifierEmails);
////        System.out.println(dto.getRole());
////        return dto;
//
//    }

    @Transactional(readOnly = true)
    @Override
    public QuestionDto findByQuestionSlugAndModifier(String slug, User user) {

        Question ques = questionRepo
                .findAccessibleBySlug(slug, user.getUserId())
                .orElseThrow(() ->
                        new EntityNotFoundException(
                                "Question not found or access denied for slug: " + slug
                        )
                );

        String role = resolveRole(ques, user);

        if (role == null) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "NO_ACCESS"
            );
        }

        return mapToQuestionDto(ques, role);
    }

    @Transactional(readOnly = true)
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

        return mapToCardDto(question);
    }



    @Transactional(readOnly = true)
    @Override
    public List<QuestionDto> getAllQuestionsByUser(User owner) {
        List<Question> qu = questionRepo.findAllByOwnerAndDeletedFalse(owner);
        return qu.stream().map(q -> {
            return mapToQuestionDto(q, "OWNER");
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
        String role = resolveRole(question, currentUser);
        return mapToQuestionDto(question, role);
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

    private Question mapToEntity(QuestionCreateDto dto, User owner) {

        Question question = new Question();

        question.setQuestionSlug(dto.getQuestionSlug());
        question.setTitle(dto.getTitle());
        question.setDescription(dto.getDescription());
        question.setDifficulty(dto.getDifficulty());
        question.setConstraints(dto.getConstraints());
        question.setOwner(owner);

        question.setSampleTestcases(
                new ArrayList<>(dto.getSampleTestcases())
        );

        question.setHiddenTestcases(
                new ArrayList<>(dto.getHiddenTestcases())
        );

        question.setModifiers(new ArrayList<>());

        return question;
    }

    private QuestionCreateDto mapToCreateDto(Question question) {

        QuestionCreateDto dto = new QuestionCreateDto();

        dto.setQuestionSlug(question.getQuestionSlug());
        dto.setTitle(question.getTitle());
        dto.setDescription(question.getDescription());
        dto.setDifficulty(question.getDifficulty());
        dto.setConstraints(question.getConstraints());
        dto.setSampleTestcases(question.getSampleTestcases());
        dto.setHiddenTestcases(question.getHiddenTestcases());

        dto.setModifiers(
                question.getModifiers()
                        .stream()
                        .map(User::getEmail)
                        .toList()
        );

        return dto;
    }

    private QuestionDto mapToQuestionDto(Question question, String role) {

        QuestionDto dto = new QuestionDto();

        dto.setQuestionSlug(question.getQuestionSlug());
        dto.setTitle(question.getTitle());
        dto.setDescription(question.getDescription());
        dto.setDifficulty(question.getDifficulty());
        dto.setConstraints(question.getConstraints());
        dto.setRole(role);

        dto.setSampleTestcases(question.getSampleTestcases());
        dto.setHiddenTestcases(question.getHiddenTestcases());

        dto.setModifiers(
                question.getModifiers()
                        .stream()
                        .filter(u -> !u.getUserId()
                                .equals(question.getOwner().getUserId()))
                        .map(User::getEmail)
                        .toList()
        );

        return dto;
    }

    private QuestionCardDto mapToCardDto(Question question) {

        QuestionCardDto dto = new QuestionCardDto();

        dto.setQuestionSlug(question.getQuestionSlug());
        dto.setTitle(question.getTitle());
        dto.setDescription(question.getDescription());
        dto.setDifficulty(question.getDifficulty());
        dto.setConstraints(question.getConstraints());
        dto.setSampleTestcases(question.getSampleTestcases());

        dto.setModifiers(
                question.getModifiers()
                        .stream()
                        .filter(u -> !u.getUserId()
                                .equals(question.getOwner().getUserId()))
                        .map(User::getEmail)
                        .toList()
        );

        return dto;
    }

    private QuestionDto toQuestionDtoFromCard(
            QuestionCardDto card,
            UUID currentUserId
    ) {
        QuestionDto dto = new QuestionDto();

        dto.setQuestionSlug(card.getQuestionSlug());
        dto.setTitle(card.getTitle());
        dto.setDescription(card.getDescription());
        dto.setDifficulty(card.getDifficulty());
        dto.setConstraints(card.getConstraints());

        // Listing → no testcases
        dto.setSampleTestcases(null);
        dto.setHiddenTestcases(null);

        // Modifiers
        List<String> modifiers =
                questionRepo.findModifierEmailsBySlug(card.getQuestionSlug());

        dto.setModifiers(modifiers);

        // Role
        boolean isOwner =
                questionRepo.existsByQuestionSlugAndOwnerUserId(
                        card.getQuestionSlug(),
                        currentUserId
                );

        dto.setRole(isOwner ? "OWNER" : "MODIFIER");

        return dto;
    }
}
