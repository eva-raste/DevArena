package com.devarena.dtos;

import com.devarena.models.ContestVisibility;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ContestDetailDto {

    private String roomId;

    private String title;

    private ContestVisibility visibility;

    private List<QuestionDto> questions;

    private String instructions;

    private LocalDateTime startTime;
    private LocalDateTime endTime;


}
