package com.devarena.dtos.profile;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ProblemStatsDto {
    private DifficultyStat easy;
    private DifficultyStat medium;
    private DifficultyStat hard;
}
