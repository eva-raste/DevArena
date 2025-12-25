package com.devarena.service.interfaces;

import com.devarena.dtos.UserDto;

public interface AuthService {
    UserDto registerUser(UserDto userDto);
}
