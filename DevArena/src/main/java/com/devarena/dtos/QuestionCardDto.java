package com.devarena.dtos;

import com.devarena.models.QuestionDifficulty;
import com.devarena.models.QuestionOrigin;
import com.devarena.models.Testcase;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class QuestionCardDto {

    private UUID questionId;

    private String questionSlug;

    private String title;

    private String description;

    private QuestionDifficulty difficulty;

    private Integer score;

    private String constraints;

    private List<Testcase> sampleTestcases;

    private List<Testcase> hiddenTestcases;

    private QuestionOrigin origin = QuestionOrigin.OWN;

}
