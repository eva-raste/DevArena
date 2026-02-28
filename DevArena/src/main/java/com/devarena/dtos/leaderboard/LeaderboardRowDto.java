package com.devarena.dtos.leaderboard;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class LeaderboardRowDto {

    private Integer rank;

    private String username;

    private Integer totalScore;

    private Integer solvedCount;

    private Long firstAcceptedSeconds;

    private Long lastAcceptedSeconds;

    private List<QuestionTimeDto> questions;
}

