package com.devarena.controller;

import com.devarena.dtos.profile.UserProfileResponse;
import com.devarena.models.User;
import com.devarena.service.UserProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class UserProfileController {

    private final UserProfileService profileService;

    @GetMapping("/{userId}")
    public UserProfileResponse publicProfile(
            @PathVariable UUID userId,
            @PageableDefault(size = 5) Pageable pageable
    ) {
        return profileService.getProfile(userId, pageable);
    }

    @GetMapping
    public UserProfileResponse myProfile(
            @AuthenticationPrincipal User user,
            @PageableDefault(size = 5) Pageable pageable
    ) {
        return profileService.getProfile(user.getUserId(), pageable);
    }
}

