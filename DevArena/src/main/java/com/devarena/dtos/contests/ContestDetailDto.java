package com.devarena.dtos.contests;

import com.devarena.dtos.questions.ContestQuestionDto;
import com.devarena.dtos.questions.QuestionDto;
import com.devarena.models.ContestStatus;
import com.devarena.models.ContestVisibility;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ContestDetailDto {

    private String roomId;

    private String title;

    private ContestVisibility visibility;

    private List<ContestQuestionDto> questions;

    private String instructions;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private ContestStatus status;

}
