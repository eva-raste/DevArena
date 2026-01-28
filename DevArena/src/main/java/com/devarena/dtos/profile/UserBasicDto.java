package com.devarena.dtos.profile;

import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
public class UserBasicDto {
    private UUID userId;
    private String displayName;
    private String email;
    private Instant joinedAt;
}

