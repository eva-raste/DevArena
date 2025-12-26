package com.devarena.dtos;

public record TokenResponse(
        String accessToken,
        String refreshToken,
        long expiresIn,
        String tokenType,
        LoginUserDto user
) {
    public static TokenResponse of(
            String accessToken,
            String refreshToken,
            long expiresIn,
            String tokenType,
            LoginUserDto user
    ) {
        return new TokenResponse(
                accessToken,
                refreshToken,
                expiresIn,
                tokenType,
                user
        );
    }
}
