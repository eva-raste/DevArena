package com.devarena.dtos.leaderboard;


import lombok.Getter;
import lombok.Setter;

@Getter
    @Setter
public class QuestionResultDto {
    private String questionSlug;
    private Integer acceptedSeconds; // null if unsolved
}
