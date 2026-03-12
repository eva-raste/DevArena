package com.devarena.service;

import com.devarena.dtos.users.UserDto;
import com.devarena.dtos.users.UserResponseDto;
import com.devarena.service.interfaces.IAuthService;
import com.devarena.service.interfaces.UserService;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class AuthServiceImpl implements IAuthService {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    @Override
    public UserResponseDto registerUser(UserDto userDto) {
        return userService.createUser(userDto);
    }

}
