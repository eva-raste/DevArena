package com.devarena.dtos;

import com.devarena.models.ContestStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@AllArgsConstructor
public class ContestStatusEvent {
    private UUID contestId;
    private ContestStatus status;
    private LocalDateTime serverTime;
}
