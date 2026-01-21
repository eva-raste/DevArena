package com.devarena.service.interfaces;

import com.devarena.dtos.users.UserDto;

public interface IAuthService {
    UserDto registerUser(UserDto userDto);
}
