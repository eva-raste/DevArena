package com.devarena.dtos.users;

import lombok.Data;

import java.util.UUID;

@Data
public class UserVerifyDto {
    private UUID userId;
    private String username;
    private String email;
}
