package com.devarena.dtos;

import com.devarena.models.QuestionDifficulty;
import com.devarena.models.Testcase;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

import java.util.List;


@Getter
@Setter
@RequiredArgsConstructor
public class QuestionDto {

    private String questionSlug;

    private String title;

    private String description;

    private QuestionDifficulty difficulty;

    private Integer score;

    private String constraints;

    private List<Testcase> sampleTestcases;

    private List<Testcase> hiddenTestcases;

}
