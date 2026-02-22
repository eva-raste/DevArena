package com.devarena.service.interfaces;

import com.devarena.dtos.users.UserDto;
import com.devarena.dtos.users.UserVerifyDto;
import com.devarena.models.User;

public interface UserService {
    UserDto createUser(UserDto userDto);
    UserDto getUserByEmail(String email);
    UserDto updateUser(UserDto userDto,String userId);
    void deleteUser(String userId);
    UserDto getUserById(String userId);
    Iterable<UserDto> getAllUsers();

    UserVerifyDto verifyUserByEmail(String email, User currentUser);
}
