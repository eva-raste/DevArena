package com.devarena.dtos.questions;

import com.devarena.models.QuestionDifficulty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuestionCardDto {

    private String questionSlug;
    private String title;
    private String description;
    private QuestionDifficulty difficulty;
    private String constraints;

    private List<Testcase> sampleTestcases;
    private List<String> modifiers;

    // Required for JPQL projection
    public QuestionCardDto(
            String questionSlug,
            String title,
            String description,
            QuestionDifficulty difficulty,
            String constraints
    ) {
        this.questionSlug = questionSlug;
        this.title = title;
        this.description = description;
        this.difficulty = difficulty;
        this.constraints = constraints;
    }
}