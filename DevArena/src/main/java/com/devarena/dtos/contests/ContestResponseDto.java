package com.devarena.dtos.contests;
import com.devarena.models.ContestStatus;
import com.devarena.models.ContestVisibility;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;


@Data
@AllArgsConstructor
@NoArgsConstructor
public class ContestResponseDto {

    //private UUID contestId;
    private String roomId;
    private String title;
    private String role;
    private ContestVisibility visibility;
    private ContestStatus status;

    private LocalDateTime startTime;
    private LocalDateTime endTime;
}
