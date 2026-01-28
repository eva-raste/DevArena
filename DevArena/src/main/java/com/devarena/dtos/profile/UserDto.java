package com.devarena.dtos.profile;

import lombok.Data;

import java.time.Instant;

@Data
public class UserDto {
    private String name;
    private String username;
    private String email;
    private Instant joinDate;
    private String avatar; // frontend generated OR backend
}

