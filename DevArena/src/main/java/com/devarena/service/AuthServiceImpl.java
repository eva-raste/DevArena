package com.devarena.service;

import com.devarena.dtos.users.UserDto;
import com.devarena.service.interfaces.IAuthService;
import com.devarena.service.interfaces.UserService;
import lombok.AllArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class AuthServiceImpl implements IAuthService {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    @Override
    public UserDto registerUser(UserDto userDto) {
        userDto.setPassword(passwordEncoder.encode(userDto.getPassword()));
        return userService.createUser(userDto);
    }

}
