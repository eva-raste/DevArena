package com.devarena.service.interfaces;

import com.devarena.dtos.UserDto;

public interface IAuthService {
    UserDto registerUser(UserDto userDto);
}
