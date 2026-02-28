package com.devarena.service.interfaces;

import com.devarena.dtos.leaderboard.LeaderboardResponseDto;
import com.devarena.dtos.leaderboard.LeaderboardRowDto;
import com.devarena.models.Contest;
import com.devarena.models.Question;
import com.devarena.models.User;
import com.devarena.models.Verdict;

import java.util.UUID;


public interface ILeaderboardService {
    public void updateLeaderboardAfterSubmission(
            Contest contest,
            Question question,
            User user,
            Verdict verdict
    );

    public LeaderboardResponseDto getLeaderboard(
            String roomId,
            int page,
            int size
    );

    LeaderboardRowDto getMyLeaderboardRow(String roomId, UUID userId);
}
