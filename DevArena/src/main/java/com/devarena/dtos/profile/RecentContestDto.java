package com.devarena.dtos.profile;

import com.devarena.models.ContestStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RecentContestDto {
    private String title;
    private LocalDateTime startTime;
    private ContestStatus status;
    private String roomId;
}

