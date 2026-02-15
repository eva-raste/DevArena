package com.devarena.dtos.questions;

import com.devarena.models.QuestionDifficulty;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

import java.util.List;
import java.util.UUID;


@Getter
@Setter
@RequiredArgsConstructor
public class QuestionDto {

    private String questionSlug;

    private String title;

    private String description;

    private QuestionDifficulty difficulty;

    private String role;

    private String constraints;

    private List<Testcase> sampleTestcases;

    private List<Testcase> hiddenTestcases;

}
