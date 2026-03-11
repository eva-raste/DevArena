package com.devarena.service;

import com.devarena.dtos.contests.ContestDetailDto;
import com.devarena.dtos.contests.ContestResponseDto;
import com.devarena.dtos.contests.CreateContestRequest;
import com.devarena.dtos.contests.EditContestRequestDto;
import com.devarena.dtos.questions.ContestQuestionDto;
import com.devarena.dtos.questions.QuestionConfig;
import com.devarena.dtos.questions.QuestionDto;
import com.devarena.dtos.questions.Testcase;
import com.devarena.models.*;
import com.devarena.repositories.IContestRepo;
import com.devarena.repositories.IQuestionRepo;
import com.devarena.repositories.UserRepository;
import com.devarena.security.RoomIdGenerator;
import com.devarena.service.interfaces.IContestService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;


@RequiredArgsConstructor
@Slf4j
@Service
public class ContestServiceImpl implements IContestService {
    private final IContestRepo contestRepo;
    private final IQuestionRepo questionRepo;
    private final ContestTaskScheduler contestTaskScheduler;
    private final UserRepository userRepository;

    public String createUniqueRoomId() {
        String roomId;
        do {
            roomId = RoomIdGenerator.generateRoomId();
        } while (contestRepo.existsByRoomId(roomId));
        return roomId;
    }

    @Override
    @Transactional
    public ContestResponseDto createContest(CreateContestRequest req, User owner) {


        if(req.getQuestions() == null || req.getQuestions().isEmpty())
        {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Questions cannot be empty");
        }

        List<String> questionSlugs = req.getQuestions()
                .stream().map(QuestionConfig::getQuestionSlug).toList();

        Set<String> uniqueSlugs = new HashSet<>(questionSlugs);

        if (uniqueSlugs.size() != questionSlugs.size()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Duplicate Slugs");
        }

        List<Question> questions =
                questionRepo.findAllByQuestionSlugIn(questionSlugs);

        // if req has no questions or fetched questions and req slugs size is unequal
        if (questions.size() != questionSlugs.size()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid Question Slugs");
        }

        Map<String, Question> questionMap = questions.stream()
                .collect(Collectors.toMap(Question::getQuestionSlug, q -> q));

        LocalDateTime now = LocalDateTime.now();

        if (req.getStartTime() != null && !req.getStartTime().isAfter(now)) {
            throw new RuntimeException("Start time must be greater than current time");
        }

        if (req.getEndTime() != null) {
            if (req.getStartTime() == null) {
                throw new RuntimeException("End time cannot exist without start time");
            }

            if (!req.getEndTime().isAfter(req.getStartTime())) {
                throw new RuntimeException("End time must be greater than start time");
            }

        }

        System.out.println("adding owner to contest\n" + owner);
        Contest contest = Contest.create(
                req,
                owner,
                createUniqueRoomId()
        );

        // Prevent duplicate emails
        List<String> modifierEmails =
                Optional.ofNullable(req.getModifiers())
                        .orElse(Collections.emptyList());

        Set<String> uniqueEmails = new HashSet<>(modifierEmails);

        if (uniqueEmails.size() != modifierEmails.size()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "DUPLICATE_MODIFIERS"
            );
        }

        List<User> modifiers =
                userRepository.findAllByEmailIn(modifierEmails);

        if (modifiers.size() != modifierEmails.size()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "INVALID_MODIFIER_EMAIL"
            );
        }

//        System.out.println(" owner id "+ owner.getUsername());
//        System.out.println("modifiers id ");
        // Prevent owner from being added
        for (User modifier : modifiers) {
//            System.out.println(modifier.getUsername());
            if (modifier.getUserId().equals(owner.getUserId())) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "OWNER_CANNOT_BE_MODIFIER"
                );
            }
        }

        contest.getModifiers().addAll(modifiers);

        List<ContestQuestion> contestQuestions = new ArrayList<>();

        for (QuestionConfig config : req.getQuestions()) {

            Question question = questionMap.get(config.getQuestionSlug());
            if (config.getScore() == null || config.getScore() <= 0) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "INVALID_SCORE"
                );
            }

            ContestQuestion cq = new ContestQuestion();
            cq.setContest(contest);
            cq.setQuestion(question);
            cq.setScore(config.getScore());
            cq.setOrderIndex(config.getOrderIndex());

            contestQuestions.add(cq);
        }


        contest.setContestQuestions(contestQuestions);


        if (contest.getStartTime() == null) {
            contest.setStartTime(LocalDateTime.now());
        }

        contest.setStatus(
                contest.getStartTime().isAfter(LocalDateTime.now())
                        ? ContestStatus.SCHEDULED
                        : ContestStatus.LIVE
        );


        Contest saved = contestRepo.save(contest);
        contestTaskScheduler.scheduleContest(saved);


        return toContestResponseDto(saved,owner);
    }


    @Override
    @Transactional(readOnly = true)
    public ContestResponseDto getContestByRoomId(String roomId, User currentUser) {
        Contest contest = contestRepo.findByRoomIdAndDeletedFalse(roomId)
                .orElseThrow(() -> new RuntimeException("Contest not found"));

        return toContestResponseDto(contest,currentUser);
    }


    @Override
    @Transactional(readOnly = true)

    public Page<ContestResponseDto> getOwnerContests(
            User currentUser,
            ContestStatus status,
            Pageable pageable
    ) {

        Page<Contest> page;

        if (status == null) {
            return contestRepo.findAccessibleContestsProjected(currentUser,currentUser.getUserId(), pageable);
        } else {
            return contestRepo.findAccessibleContestsByStatusProjected(currentUser,currentUser.getUserId(), status, pageable);
        }
    }


    @Override
    @Transactional(readOnly = true)

    public ContestDetailDto getContestDetails(String roomId, User currentUser) {
        Contest contest = contestRepo.findByRoomIdAndDeletedFalse(roomId)
                .orElseThrow(() -> new RuntimeException("Contest not found"));

        return toContestDetailDto(contest,currentUser);
    }

    public Contest assertEditable(String roomid,User currentUser) {
        Contest contest = contestRepo
                .findByRoomIdAndDeletedFalse(roomid)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "CONTEST_NOT_FOUND"
                ));


        UUID userId = currentUser.getUserId();

        boolean isOwner =
                contest.getOwner().getUserId().equals(userId);

        boolean isModifier =
                contest.getModifiers()
                        .stream()
                        .anyMatch(m -> m.getUserId().equals(userId));

        if (!isOwner && !isModifier) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "NOT_ALLOWED"
            );
        }


        if (contest.getStatus() != ContestStatus.SCHEDULED) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "CONTEST_STATUS_NOT_SCHEDULED"
            );
        }

        if (contest.getStartTime() != null &&
                LocalDateTime.now().isAfter(contest.getStartTime())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "CONTEST_ALREADY_STARTED"
            );
        }
        return contest;
    }

    @Override
    @Transactional
    public boolean deleteContest(String roomid, User currentUser) {
        Contest contest = assertEditable(roomid,currentUser);

        if (!contest.getOwner().equals(currentUser)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "NOT_ALLOWED"
            );
        }
        if (contest.isDeleted()) {
            return false;
        }

        contest.setDeleted(true);
        contestTaskScheduler.cancelContestTasks(contest.getRoomId());
        return true;
    }

    @Transactional
    @Override
    public ContestDetailDto updateContest(
            String roomId,
            EditContestRequestDto dto,
            User currentUser) {

        Contest contest = assertEditable(roomId, currentUser);

        // ---- TIME VALIDATION ----

        if (dto.getStartTime() != null &&
                dto.getStartTime().isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "START_TIME_IN_PAST"
            );
        }

        if (dto.getStartTime() != null &&
                dto.getEndTime() != null &&
                dto.getEndTime().isBefore(dto.getStartTime())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "END_BEFORE_START"
            );
        }

        // ---- UPDATE BASIC FIELDS ----

        contest.setTitle(dto.getTitle());
        contest.setVisibility(dto.getVisibility());
        contest.setInstructions(dto.getInstructions());
        contest.setStartTime(dto.getStartTime());
        contest.setEndTime(dto.getEndTime());

        // ---- QUESTIONS VALIDATION ----

        if (dto.getQuestions() == null || dto.getQuestions().isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Questions cannot be empty"
            );
        }

        List<String> slugs = dto.getQuestions()
                .stream()
                .map(QuestionConfig::getQuestionSlug)
                .toList();

        Set<String> uniqueSlugs = new HashSet<>(slugs);
        if (uniqueSlugs.size() != slugs.size()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "DUPLICATE_QUESTIONS_NOT_ALLOWED"
            );
        }

        List<Question> questions =
                questionRepo.findAllByQuestionSlugIn(slugs);

        if (questions.size() != slugs.size()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "INVALID_QUESTION_SLUG"
            );
        }

        Map<String, Question> questionMap = questions.stream()
                .collect(Collectors.toMap(
                        Question::getQuestionSlug,
                        q -> q
                ));

        // ---- SAFE COLLECTION SYNCHRONIZATION ----

        // Map existing contest questions by slug
        Map<String, ContestQuestion> existingMap =
                contest.getContestQuestions()
                        .stream()
                        .collect(Collectors.toMap(
                                cq -> cq.getQuestion().getQuestionSlug(),
                                cq -> cq
                        ));

        List<ContestQuestion> updatedList = new ArrayList<>();

        for (QuestionConfig config : dto.getQuestions()) {

            if (config.getScore() == null || config.getScore() <= 0) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "INVALID_SCORE"
                );
            }

            String slug = config.getQuestionSlug();
            Question question = questionMap.get(slug);

            ContestQuestion existing = existingMap.get(slug);

            if (existing != null) {
                // Update existing entity
                existing.setScore(config.getScore());
                existing.setOrderIndex(config.getOrderIndex());
                updatedList.add(existing);
            } else {
                // Create new entity
                ContestQuestion newCq = new ContestQuestion();
                newCq.setContest(contest);
                newCq.setQuestion(question);
                newCq.setScore(config.getScore());
                newCq.setOrderIndex(config.getOrderIndex());
                updatedList.add(newCq);
            }
        }
        contest.getContestQuestions().clear();

        contest.getContestQuestions().addAll(updatedList);

        // ---- MODIFIERS SYNC (OWNER ONLY) ----

        if (contest.getOwner().getUserId()
                .equals(currentUser.getUserId())) {

            contest.getModifiers().clear();

            if (dto.getModifiers() != null && !dto.getModifiers().isEmpty()) {

                List<User> users = userRepository.findAllByEmailIn(dto.getModifiers());

                if (users.size() != dto.getModifiers().size()) {
                    throw new ResponseStatusException(
                            HttpStatus.BAD_REQUEST,
                            "ONE_OR_MORE_USERS_NOT_FOUND"
                    );
                }

                contest.getModifiers().addAll(
                        users.stream()
                                .filter(u -> !u.getUserId()
                                        .equals(contest.getOwner().getUserId()))
                                .toList()
                );
            }
        }
        Contest saved = contestRepo.save(contest);
        contestTaskScheduler.scheduleContest(saved);
        return toContestDetailDto(saved, currentUser);
    }


    @Override
    @Transactional(readOnly = true)

    public Page<ContestResponseDto> getPublicContests(
            Pageable pageable,
            ContestStatus status
    ) {
        Page<Contest> contests;

        if (status == null) {
            return contestRepo.findVisibleContestsProjected(
                    ContestVisibility.PUBLIC,
                    pageable
            );
        }
        return contestRepo.findVisibleContestsByStatusProjected(
                ContestVisibility.PUBLIC,
                status,
                pageable
        );
    }

    @Override
    @Transactional
    public void removeModifier(String roomId, String email, String currentUserEmail) {

        Contest contest = contestRepo.findByRoomId(roomId)
                .orElseThrow(() -> new RuntimeException("Contest not found"));

        // Only owner can remove modifiers
        if (!contest.getOwner().getEmail().equals(currentUserEmail)) {
            throw new RuntimeException("Only owner can remove modifiers");
        }

        // Cannot remove owner
        if (contest.getOwner().getEmail().equals(email)) {
            throw new RuntimeException("Owner cannot be removed");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        contest.getModifiers().remove(user);

        contestRepo.save(contest);
    }

    private ContestResponseDto toContestResponseDto(Contest contest, User currentUser) {

        ContestResponseDto dto = new ContestResponseDto();

        dto.setRoomId(contest.getRoomId());
        dto.setTitle(contest.getTitle());
        dto.setVisibility(contest.getVisibility());
        dto.setStatus(contest.getStatus());
        dto.setStartTime(contest.getStartTime());
        dto.setEndTime(contest.getEndTime());

        UUID currentUserId = currentUser.getUserId();

        if (contest.getOwner().getUserId().equals(currentUserId)) {
            dto.setRole("OWNER");
        } else if (contest.getModifiers()
                .stream()
                .anyMatch(m -> m.getUserId().equals(currentUserId))) {
            dto.setRole("MODIFIER");
        }

        return dto;
    }



    private ContestDetailDto toContestDetailDto(
            Contest contest,
            User currentUser
    ) {

        UUID currentUserId = currentUser.getUserId();

        ContestDetailDto dto = new ContestDetailDto();

        dto.setRoomId(contest.getRoomId());
        dto.setTitle(contest.getTitle());
        dto.setVisibility(contest.getVisibility());
        dto.setInstructions(contest.getInstructions());
        dto.setStartTime(contest.getStartTime());
        dto.setEndTime(contest.getEndTime());
        dto.setStatus(contest.getStatus());

        // 🔹 Role computation
        if (contest.getOwner().getUserId().equals(currentUserId)) {
            dto.setRole("OWNER");
        } else if (contest.getModifiers()
                .stream()
                .anyMatch(m -> m.getUserId().equals(currentUserId))) {
            dto.setRole("MODIFIER");
        } else {
            dto.setRole("PARTICIPANT");
        }

        // 🔹 Contest Modifiers (excluding owner)
        List<String> modifierEmails = contest.getModifiers()
                .stream()
                .filter(m -> !m.getUserId().equals(contest.getOwner().getUserId()))
                .map(User::getEmail)
                .toList();

        dto.setModifiers(modifierEmails);

        // 🔹 Questions mapping
        List<ContestQuestionDto> questionDtos = contest.getContestQuestions()
                .stream()
                .sorted(Comparator.comparing(
                        ContestQuestion::getOrderIndex,
                        Comparator.nullsLast(Integer::compareTo)
                ))
                .map(cq -> {

                    Question question = cq.getQuestion();

                    QuestionDto qdto = new QuestionDto();

                    qdto.setQuestionSlug(question.getQuestionSlug());
                    qdto.setTitle(question.getTitle());
                    qdto.setDescription(question.getDescription());
                    qdto.setDifficulty(question.getDifficulty());
                    qdto.setConstraints(question.getConstraints());

                    // Question role
                    if (question.getOwner().getUserId().equals(currentUserId)) {
                        qdto.setRole("OWNER");
                    } else if (question.getModifiers()
                            .stream()
                            .anyMatch(m -> m.getUserId().equals(currentUserId))) {
                        qdto.setRole("MODIFIER");
                    }

                    // Question modifiers
                    List<String> questionModifiers = question.getModifiers()
                            .stream()
                            .map(User::getEmail)
                            .toList();

                    qdto.setModifiers(questionModifiers);

                    // Sample testcases
                    List<Testcase> sample = question.getSampleTestcases()
                            .stream()
                            .map(t -> new Testcase(
                                    t.getOrder(),
                                    t.getInput(),
                                    t.getOutput()
                            ))
                            .toList();

                    qdto.setSampleTestcases(sample);

                    // Hidden testcases
                    List<Testcase> hidden = question.getHiddenTestcases()
                            .stream()
                            .map(t -> new Testcase(
                                    t.getOrder(),
                                    t.getInput(),
                                    t.getOutput()
                            ))
                            .toList();

                    qdto.setHiddenTestcases(hidden);

                    ContestQuestionDto contestQuestionDto = new ContestQuestionDto();
                    contestQuestionDto.setQuestion(qdto);
                    contestQuestionDto.setScore(cq.getScore());
                    contestQuestionDto.setOrderIndex(cq.getOrderIndex());

                    return contestQuestionDto;
                })
                .toList();

        dto.setQuestions(questionDtos);

        return dto;
    }
}
