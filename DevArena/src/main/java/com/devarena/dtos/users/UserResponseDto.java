package com.devarena.dtos.users;

import lombok.*;

import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserResponseDto {

    private UUID userId;
    private String displayName;
    private String email;
}