package com.devarena.dtos.leaderboard;

import java.time.LocalDateTime;
import java.util.UUID;

public interface LeaderboardProjection {

    UUID getUserId();
    String getUsername();

    int getTotalScore();
    int getSolvedCount();

    LocalDateTime getFirstAcceptedAt();
    LocalDateTime getLastAcceptedAt();

    Integer getRank();
}

