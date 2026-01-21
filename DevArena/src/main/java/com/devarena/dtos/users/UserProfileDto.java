package com.devarena.dtos.users;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfileDto {
    private UUID userId;

    @NotBlank(message = "Username is required")
    private String displayName;

    @Email(message = "Invalid email format")
    @NotBlank(message = "Email is required")
    private String email;



}
