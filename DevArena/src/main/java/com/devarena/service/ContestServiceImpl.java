package com.devarena.service;

import com.devarena.dtos.ContestDetailDto;
import com.devarena.dtos.ContestResponseDto;
import com.devarena.dtos.CreateContestRequest;
import com.devarena.dtos.QuestionDto;
import com.devarena.models.Contest;
import com.devarena.models.ContestStatus;
import com.devarena.models.Question;
import com.devarena.models.User;
import com.devarena.repositories.IContestRepo;
import com.devarena.repositories.IQuestionRepo;
import com.devarena.security.RoomIdGenerator;
import com.devarena.service.interfaces.IContestService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.stereotype.Service;

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
    public List<ContestResponseDto> getOwnerContests(User owner) {
        List<Contest> contests =  contestRepo.findAllByOwnerAndDeletedFalse(owner);
        return contests.stream().map(this::toResponseDto).toList();
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

        ContestDetailDto dto = new ContestDetailDto();

        dto.setRoomId(contest.getRoomId());
        dto.setContestId(contest.getContestId());
        dto.setTitle(contest.getTitle());
        dto.setVisibility(contest.getVisibility());
        dto.setInstructions(contest.getInstructions());
        dto.setStartTime(contest.getStartTime());
        dto.setEndTime(contest.getEndTime());
        dto.setStatus(contest.getStatus());
        // Map questions
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

        if (contest.isDeleted()) {
            return false;
        }

        contest.setDeleted(true);
        return true;
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

        dto.setContestId(contest.getContestId());
        dto.setRoomId(contest.getRoomId());
        dto.setTitle(contest.getTitle());
        dto.setVisibility(contest.getVisibility());
        dto.setStatus(contest.getStatus());
        dto.setStartTime(contest.getStartTime());
        dto.setEndTime(contest.getEndTime());

        return dto;
    }
}
