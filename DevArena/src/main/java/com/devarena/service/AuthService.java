package com.devarena.service;

import com.devarena.dtos.UserDto;

public interface AuthService {
    UserDto registerUser(UserDto userDto);
}
