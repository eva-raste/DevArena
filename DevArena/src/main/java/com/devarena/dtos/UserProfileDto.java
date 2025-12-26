package com.devarena.dtos;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
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
