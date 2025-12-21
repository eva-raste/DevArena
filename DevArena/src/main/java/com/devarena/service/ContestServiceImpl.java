package com.devarena.service;

import com.devarena.dtos.ContestResponseDto;
import com.devarena.dtos.CreateContestRequest;
import com.devarena.models.Contest;
import com.devarena.models.Question;
import com.devarena.models.User;
import com.devarena.repositories.IContestRepo;
import com.devarena.repositories.IQuestionRepo;
import com.devarena.security.RoomIdGenerator;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;


@Service
@RequiredArgsConstructor
public class ContestServiceImpl implements IContestService {

    private final IContestRepo contestRepo;
    private final IQuestionRepo questionRepo;

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

        if (questions.size() != req.getQuestionSlugs().size()) {
            throw new RuntimeException("Invalid question slugs");
        }

        Contest contest = Contest.create(
                req,
                owner, // owner intentionally null
                questions,
                createUniqueRoomId()
        );

        Contest saved = contestRepo.save(contest);
        return toResponseDto(saved);
    }

    @Override
    public ContestResponseDto getContestByRoomId(String roomId) {
        Contest contest = contestRepo.findByRoomId(roomId)
                .orElseThrow(() -> new RuntimeException("Contest not found"));

        return toResponseDto(contest);
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
