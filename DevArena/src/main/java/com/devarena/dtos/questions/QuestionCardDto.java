package com.devarena.dtos.questions;

import com.devarena.models.QuestionDifficulty;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class QuestionCardDto {

    private String questionSlug;

    private String title;

    private String description;

    private QuestionDifficulty difficulty;

    private String constraints;

    private List<Testcase> sampleTestcases;

}
