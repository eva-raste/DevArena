package com.devarena.dtos.profile;

import lombok.Data;
import org.springframework.data.domain.Page;

import java.util.List;

@Data
public class UserProfileResponse {
    private UserBasicDto user;
    private UserStatsDto stats;
    private ProblemStatsDto problemStats;
    private Page<RecentContestDto> recentContests;
    private Page<RecentSubmissionDto> recentSubmissions;
    private List<MonthlyProgressDto> monthlyProgress;
}


