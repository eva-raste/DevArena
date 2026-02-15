package com.devarena.dtos.questions;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ContestQuestionDto {

    private QuestionDto question;
    private Integer score;
    private Integer orderIndex;
}

