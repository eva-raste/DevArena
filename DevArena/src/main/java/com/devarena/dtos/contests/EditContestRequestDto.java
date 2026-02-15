package com.devarena.dtos.contests;

import com.devarena.dtos.questions.QuestionConfig;
import com.devarena.models.ContestVisibility;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class EditContestRequestDto {

    @NotBlank
    private String title;

    @NotNull
    private ContestVisibility visibility;

    @NotNull
    private List<QuestionConfig> questions;

    private String instructions;

    private LocalDateTime startTime;
    private LocalDateTime endTime;
}
