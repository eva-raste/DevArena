package com.devarena.dtos.leaderboard;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class QuestionMetaDto {
    private String questionSlug;
    private String title;
    private int score;
}
