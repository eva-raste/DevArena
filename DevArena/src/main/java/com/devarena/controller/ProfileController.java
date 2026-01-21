package com.devarena.controller;

import com.devarena.dtos.users.UserProfileDto;
import com.devarena.service.interfaces.UserService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final UserService userService;
    private final ModelMapper modelMapper;

    @GetMapping("/me")
    public ResponseEntity<UserProfileDto> me(Authentication authentication) {
        return ResponseEntity.ok(
                modelMapper.map(
                        userService.getUserByEmail(authentication.getName()),UserProfileDto.class
                ));
    }
}
