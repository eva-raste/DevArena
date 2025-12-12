package com.devarena.dtos;

import com.devarena.models.Contest;
import com.devarena.models.Testcase;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuestionCreateDto {

    private List<Contest> contests;

    private String question_slug;
    private String title;
    private String description;
    private String difficulty;
    private Integer score;
    private String constraints;
    private List<Testcase> sampleTestcases;
    private List<Testcase> hiddenTestcases;
}
