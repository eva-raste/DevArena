package com.devarena.dtos;

import com.devarena.models.QuestionDifficulty;
import lombok.Data;

import java.util.UUID;

@Data
public class QuestionCardDto {

    private UUID questionId;

    private String questionSlug;

    private String title;

    private String description;

    private QuestionDifficulty difficulty;

    private Integer score;
}
