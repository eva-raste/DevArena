package com.devarena.service.interfaces;

import com.devarena.dtos.users.UserDto;
import com.devarena.dtos.users.UserResponseDto;
import com.devarena.dtos.users.UserVerifyDto;
import com.devarena.models.User;

public interface UserService {
    UserResponseDto createUser(UserDto userDto);
    UserResponseDto getUserByEmail(String email);
    UserResponseDto updateUser(UserDto userDto,String userId);
    void deleteUser(String userId);
    UserResponseDto getUserById(String userId);
    Iterable<UserResponseDto> getAllUsers();

    UserVerifyDto verifyUserByEmail(String email, User currentUser);
}
