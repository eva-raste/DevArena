package com.devarena.dtos.profile;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;

@Data
@AllArgsConstructor
public class DifficultyStat {
    private long solved;
    private long total;


}
