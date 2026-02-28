package com.devarena.controller;

import com.devarena.dtos.leaderboard.LeaderboardResponseDto;
import com.devarena.dtos.leaderboard.LeaderboardRowDto;
import com.devarena.models.User;
import com.devarena.service.interfaces.ILeaderboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/contests")
@RequiredArgsConstructor
public class LeaderboardController {

    private final ILeaderboardService leaderboardService;

    @GetMapping("/{roomId}/leaderboard")
    public ResponseEntity<LeaderboardResponseDto> getLeaderboard(
            @PathVariable String roomId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size
    ) {
        if (page < 0) {
            throw new IllegalArgumentException("Page cannot be negative");
        }

        if (size <= 0 || size > 200) {
            throw new IllegalArgumentException("Invalid page size");
        }

        LeaderboardResponseDto response =
                leaderboardService.getLeaderboard(roomId, page, size);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{roomId}/leaderboard/me")
    public ResponseEntity<LeaderboardRowDto> getMyRank(
            @PathVariable String roomId,
           @AuthenticationPrincipal User user
    ) {


        LeaderboardRowDto dto =
                leaderboardService.getMyLeaderboardRow(
                        roomId,
                        user.getUserId()
                );

        if (dto == null) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(dto);
    }

}

