package com.devarena.service;

import com.devarena.dtos.contests.ContestDetailDto;
import com.devarena.dtos.contests.ContestResponseDto;
import com.devarena.dtos.contests.CreateContestRequest;
import com.devarena.dtos.contests.EditContestRequestDto;
import com.devarena.dtos.questions.ContestQuestionDto;
import com.devarena.dtos.questions.QuestionConfig;
import com.devarena.dtos.questions.QuestionDto;
import com.devarena.models.*;
import com.devarena.repositories.IContestRepo;
import com.devarena.repositories.IQuestionRepo;
import com.devarena.security.RoomIdGenerator;
import com.devarena.service.interfaces.IContestService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;


@RequiredArgsConstructor
@Slf4j
@Service
public class ContestServiceImpl implements IContestService {
    private final TaskScheduler taskScheduler;
    private final IContestRepo contestRepo;
    private final IQuestionRepo questionRepo;
    private final ContestTaskScheduler contestTaskScheduler;
    private final ModelMapper modelMapper;

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

        return toResponseDto(saved);
    }


    @Override
    public ContestResponseDto getContestByRoomId(String roomId) {
        Contest contest = contestRepo.findByRoomIdAndDeletedFalse(roomId)
                .orElseThrow(() -> new RuntimeException("Contest not found"));

        return toResponseDto(contest);
    }

    @Override
    public Page<ContestResponseDto> getOwnerContests(
            User owner,
            ContestStatus status,
            Pageable pageable
    ) {
        Page<Contest> page;

        if (status == null) {
            page = contestRepo.findAllByOwnerAndDeletedFalse(owner, pageable);
        } else {
            page = contestRepo.findAllByOwnerAndStatusAndDeletedFalse(owner, status, pageable);
        }

        return page.map(contest ->
                modelMapper.map(contest, ContestResponseDto.class)
        );
    }

    @Override
    public ContestDetailDto getContestDetails(String roomId) {
        Contest contest = contestRepo.findByRoomIdAndDeletedFalse(roomId)
                .orElseThrow(() -> new RuntimeException("Contest not found"));

        return toContestDetailDto(contest);
    }

    public Contest assertEditable(String roomid,User currentUser) {
        Contest contest = contestRepo
                .findByRoomIdAndDeletedFalse(roomid)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "CONTEST_NOT_FOUND"
                ));


        if (!contest.getOwner().equals(currentUser)
                && !contest.getModifiers().contains(currentUser)) {
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
    public boolean deleteContest(String roomid, User owner) {
        Contest contest = assertEditable(roomid,owner);

        if (contest.isDeleted()) {
            return false;
        }

        contest.setDeleted(true);
        return true;
    }

    @Transactional
    @Override
    public ContestDetailDto updateContest(
            String roomId,
            EditContestRequestDto dto,
            User owner) {

        Contest contest = assertEditable(roomId, owner);
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

        // ---- UPDATE FIELDS ----

        assert contest != null;
        contest.setTitle(dto.getTitle());
        contest.setVisibility(dto.getVisibility());
        contest.setInstructions(dto.getInstructions());
        contest.setStartTime(dto.getStartTime());
        contest.setEndTime(dto.getEndTime());

        // ---- QUESTIONS ----
        if(dto.getQuestions() == null || dto.getQuestions().isEmpty())
        {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Questions cannot be empty");
        }
        List<String> slugs = dto.getQuestions()
                .stream()
                .map(QuestionConfig::getQuestionSlug)
                .toList();

        List<Question> questions =
                questionRepo.findAllByQuestionSlugIn(slugs);
        Set<String> uniqueSlugs = new HashSet<>(slugs);

        if (uniqueSlugs.size() != slugs.size()) {
            throw new RuntimeException("Duplicate questions not allowed");
        }

        if (questions.size() != slugs.size()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "INVALID_QUESTION_SLUG"
            );
        }

        // map slug -> question
        Map<String, Question> questionMap = questions.stream()
                .collect(Collectors.toMap(
                        Question::getQuestionSlug,
                        q -> q
                ));

        List<ContestQuestion> contestQuestions = dto.getQuestions()
                .stream()
                .map(config -> {

                    if (config.getScore() == null || config.getScore() <= 0) {
                        throw new ResponseStatusException(
                                HttpStatus.BAD_REQUEST,
                                "INVALID_SCORE"
                        );
                    }

                    Question q = questionMap.get(config.getQuestionSlug());

                    ContestQuestion cq = new ContestQuestion();
                    cq.setContest(contest);
                    cq.setQuestion(q);
                    cq.setScore(config.getScore());
                    cq.setOrderIndex(config.getOrderIndex());
                    return cq;
                })
                .toList();


        contest.setContestQuestions(new ArrayList<>(contestQuestions));
        Contest saved = contestRepo.save(contest);


        return toContestDetailDto(saved);
    }

    @Override
    public Page<ContestResponseDto> getPublicContests(
            Pageable pageable,
            ContestStatus status
    ) {
        Page<Contest> contests;

        if (status == null) {
            contests = contestRepo.findByDeletedFalseAndVisibility(
                    ContestVisibility.PUBLIC,
                    pageable
            );
        } else {
            contests = contestRepo.findByDeletedFalseAndVisibilityAndStatus(
                    ContestVisibility.PUBLIC,
                    status,
                    pageable
            );
        }

        return contests.map(c -> modelMapper.map(c, ContestResponseDto.class));
    }






    private QuestionDto toQuestionDto(Question question) {
        QuestionDto dto = new QuestionDto();
        dto.setQuestionSlug(question.getQuestionSlug());
        dto.setHiddenTestcases(question.getHiddenTestcases());
        dto.setSampleTestcases(question.getSampleTestcases());
        dto.setConstraints(question.getConstraints());
        dto.setDifficulty(question.getDifficulty());
        dto.setTitle(question.getTitle());
        dto.setDescription(question.getDescription());
        return dto;
    }

    private ContestResponseDto toResponseDto(Contest contest) {
        ContestResponseDto dto = new ContestResponseDto();

        dto.setRoomId(contest.getRoomId());
        dto.setTitle(contest.getTitle());
        dto.setVisibility(contest.getVisibility());
        dto.setStatus(contest.getStatus());
        dto.setStartTime(contest.getStartTime());
        dto.setEndTime(contest.getEndTime());

        return dto;
    }

    private ContestDetailDto toContestDetailDto(Contest contest) {
        ContestDetailDto res = modelMapper.map(contest, ContestDetailDto.class);
        List<ContestQuestionDto> questionDtos = contest.getContestQuestions()
                .stream()
                .sorted(Comparator.comparing(ContestQuestion::getOrderIndex,
                        Comparator.nullsLast(Integer::compareTo)))
                .map(cq -> {
                    ContestQuestionDto condto = new ContestQuestionDto();
                    condto.setQuestion(modelMapper.map(
                            cq.getQuestion(),
                            QuestionDto.class
                    ));

                    condto.setScore(cq.getScore());
                    condto.setOrderIndex(cq.getOrderIndex());
                    return condto;
                })
                .toList();

        res.setQuestions(questionDtos);
        return res;
    }

}
