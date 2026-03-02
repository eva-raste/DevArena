package com.devarena.service.interfaces;

import com.devarena.dtos.users.UserDto;
import com.devarena.dtos.users.UserResponseDto;

public interface IAuthService {
    UserResponseDto registerUser(UserDto userDto);
}
