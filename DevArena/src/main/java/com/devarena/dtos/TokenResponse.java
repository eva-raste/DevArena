package com.devarena.dtos;

public record TokenResponse(
        String accessToken,
        String refreshtoken,
        long expiresIn,
        String tokenType,
        UserDto user
) {
    public static TokenResponse of(String accessToken, String refreshtoken, long expiresIn, String tokenType, UserDto user)
    {
        return new TokenResponse(accessToken,refreshtoken,expiresIn,"Bearer",user);
    }
}
