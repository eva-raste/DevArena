package com.devarena.service;

import com.devarena.dtos.contests.ContestDetailDto;
import com.devarena.dtos.contests.ContestResponseDto;
import com.devarena.dtos.contests.CreateContestRequest;
import com.devarena.dtos.contests.EditContestRequestDto;
import com.devarena.dtos.questions.QuestionDto;
import com.devarena.models.*;
import com.devarena.repositories.IContestRepo;
import com.devarena.repositories.IQuestionRepo;
import com.devarena.security.RoomIdGenerator;
import com.devarena.service.interfaces.IContestService;
import jakarta.persistence.EntityNotFoundException;
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
import java.util.List;


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

        List<Question> questions =
                questionRepo.findAllByQuestionSlugIn(req.getQuestionSlugs());

        // if req has no questions or fetched questions and req slugs size is unequal
        if (req.getQuestionSlugs() == null || questions.size() != req.getQuestionSlugs().size()) {
            throw new RuntimeException("Invalid question slugs");
        }

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

            if (!req.getEndTime().isAfter(now)) {
                throw new RuntimeException("End time must be greater than current time");
            }
        }

        System.out.println("adding owner to contest\n" + owner);
        Contest contest = Contest.create(
                req,
                owner,
                questions,
                createUniqueRoomId()
        );

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



//    @Override
//    public List<ContestResponseDto> getAllPublicContests() {
//        List<Contest> contests = contestRepo.findByVisibilityIsPublic();
//        return contests.stream().map(
//            this::toResponseDto
//        )
//        .toList();
//    }

//    public ContestResponseDto

    @Override
    public ContestDetailDto getContestDetails(String roomId) {
        Contest contest = contestRepo.findByRoomIdAndDeletedFalse(roomId)
                .orElseThrow(() -> new RuntimeException("Contest not found"));

        ContestDetailDto dto =
                modelMapper.map(contest, ContestDetailDto.class);

        List<QuestionDto> questions = contest.getQuestions()
                .stream()
                .map(this::toQuestionDto)
                .toList();

        dto.setQuestions(questions);

        return dto;

    }


    @Override
    @Transactional
    public boolean deleteContest(String roomid) {
        Contest contest = contestRepo
                .findByRoomIdAndDeletedFalse(roomid)
                .orElseThrow(() -> new EntityNotFoundException("Contest not found"));
        if (contest.getStatus() != ContestStatus.SCHEDULED) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "CONTEST_STATUS_NOT_SCHEDULED"
            );
        }

        if (contest.getStartTime() != null &&
                LocalDateTime.now().isAfter(contest.getStartTime())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "CONTEST_ALREADY_STARTED"
            );
        }

        if (contest.isDeleted()) {
            return false;
        }

        contest.setDeleted(true);
        return true;
    }

    public void assertEditable(String roomid) {
        Contest contest = contestRepo
                .findByRoomIdAndDeletedFalse(roomid)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "CONTEST_NOT_FOUND"
                ));

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
    }

    @Transactional
    @Override
    public ContestDetailDto updateContest(
            String roomId,
            EditContestRequestDto dto
    ) {
        Contest contest = contestRepo
                .findByRoomIdAndDeletedFalse(roomId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "CONTEST_NOT_FOUND"
                ));

        // ---- EDIT VALIDITY CHECKS ----

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

        contest.setTitle(dto.getTitle());
        contest.setVisibility(dto.getVisibility());
        contest.setInstructions(dto.getInstructions());
        contest.setStartTime(dto.getStartTime());
        contest.setEndTime(dto.getEndTime());

        // ---- QUESTIONS ----
        // Resolve question slugs → entities
        List<Question> questions =
                questionRepo.findAllByQuestionSlugIn(dto.getQuestionSlugs());

        if (questions.size() != dto.getQuestionSlugs().size()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "INVALID_QUESTION_SLUG"
            );
        }

        contest.setQuestions(questions);

        Contest saved = contestRepo.save(contest);

        return modelMapper.map(saved, ContestDetailDto.class);
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
        dto.setScore(question.getScore());
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
}
