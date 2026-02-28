package com.devarena.dtos.leaderboard;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class QuestionTimeDto {

    private String questionSlug;
    private Long acceptedSeconds;


}

