package com.devarena.dtos.contests;
import com.devarena.models.ContestStatus;
import com.devarena.models.ContestVisibility;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;


@Data
public class ContestResponseDto {

    //private UUID contestId;
    private String roomId;
    private String title;

    private ContestVisibility visibility;
    private ContestStatus status;

    private LocalDateTime startTime;
    private LocalDateTime endTime;
}
