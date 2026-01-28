package com.devarena.service;

import com.devarena.dtos.profile.*;
import com.devarena.models.QuestionDifficulty;
import com.devarena.models.User;
import com.devarena.repositories.IContestRepo;
import com.devarena.repositories.IQuestionRepo;
import com.devarena.repositories.ISubmissionRepo;
import com.devarena.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserProfileService {

    private final UserRepository userRepo;
    private final ISubmissionRepo submissionRepo;
    private final IContestRepo contestRepo;
    private final IQuestionRepo questionRepo;
    private final ModelMapper modelMapper;

    public UserProfileResponse getProfile(UUID userId, Pageable pageable) {

        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserProfileResponse res = new UserProfileResponse();

        // user
        res.setUser(mapUser(user));

        // stats
        res.setStats(buildStats(userId));

        // difficulty stats
        res.setProblemStats(buildProblemStats(userId));

        // recent contests
        res.setRecentContests(
                contestRepo.recentAttended(userId, pageable)
                        .map(c -> modelMapper.map(c,RecentContestDto.class))
        );

        // recent submissions
        res.setRecentSubmissions(
                submissionRepo.findByUserIdOrderBySubmittedAtDesc(userId, pageable)
                        .map(s -> new RecentSubmissionDto(
                                s.getSubmissionId(),
                                s.getContestId(),
                                s.getQuestionId(),
                                s.getVerdict(),
                                s.getSubmittedAt()
                        ))
        );

        // monthly progress
        res.setMonthlyProgress(buildMonthlyProgress(userId));

        return res;
    }

    private UserBasicDto mapUser(User user) {
        UserBasicDto dto = new UserBasicDto();
        dto.setUserId(user.getUserId());
        dto.setDisplayName(user.getDisplayName());
        dto.setEmail(user.getEmail());
        dto.setJoinedAt(user.getCreatedAt());
        return dto;
    }

    private UserStatsDto buildStats(UUID userId) {
        UserStatsDto dto = new UserStatsDto();
        dto.setContestsAttended(submissionRepo.countDistinctContests(userId));
        dto.setTotalSubmissions(submissionRepo.countByUserId(userId));
        dto.setQuestionsSolved(submissionRepo.countSolved(userId));
        return dto;
    }

    private ProblemStatsDto buildProblemStats(UUID userId) {
        return new ProblemStatsDto(
                buildDifficulty(userId, QuestionDifficulty.EASY),
                buildDifficulty(userId, QuestionDifficulty.MEDIUM),
                buildDifficulty(userId, QuestionDifficulty.HARD)
        );
    }

    private DifficultyStat buildDifficulty(UUID userId, QuestionDifficulty difficulty) {
        long solved = submissionRepo.countSolvedByDifficulty(userId, difficulty);
        long total = questionRepo.countByDifficultyAndDeletedFalse(difficulty);
        return new DifficultyStat(solved, total);
    }


    private List<MonthlyProgressDto> buildMonthlyProgress(UUID userId) {
        return submissionRepo.monthlySolved(userId)
                .stream()
                .map(r -> new MonthlyProgressDto(
                        (int) r[0],
                        (int) r[1],
                        (long) r[2]
                ))
                .toList();
    }
}
