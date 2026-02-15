package com.devarena.dtos.questions;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class QuestionConfig {

    private String questionSlug;
    private Integer score;
    private Integer orderIndex;
}

