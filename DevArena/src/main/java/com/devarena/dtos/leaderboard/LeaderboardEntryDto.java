package com.devarena.dtos.leaderboard;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class LeaderboardEntryDto {
    private int rank;

    private String username;

    private int totalScore;
    private int solvedCount;

    private Integer firstAcceptedSeconds;
    private Integer lastAcceptedSeconds;

    private List<QuestionResultDto> questions;
}
