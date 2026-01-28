package com.devarena.dtos.profile;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class MonthlyProgressDto {
    private int year;
    private int month;
    private long solvedCount;
}


