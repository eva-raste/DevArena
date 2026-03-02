package com.devarena.dtos.questions;

import com.devarena.models.QuestionDifficulty;
import lombok.*;

import java.util.List;
import java.util.UUID;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class QuestionDto {

    private String questionSlug;
    private String title;
    private String description;
    private QuestionDifficulty difficulty;
    private String role;
    private String constraints;
    private List<Testcase> sampleTestcases;
    private List<Testcase> hiddenTestcases;
    private List<String> modifiers;

    // Required for JPQL projection
    public QuestionDto(
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