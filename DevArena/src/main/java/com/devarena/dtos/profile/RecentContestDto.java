package com.devarena.dtos.profile;

import com.devarena.models.ContestStatus;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class RecentContestDto {
    private UUID contestId;
    private String title;
    private LocalDateTime startTime;
    private ContestStatus status;
    private String roomId;
}

