package com.devarena.controller;


import com.devarena.dtos.ContestDetailDto;
import com.devarena.dtos.ContestResponseDto;
import com.devarena.dtos.CreateContestRequest;
import com.devarena.models.User;
import com.devarena.service.interfaces.IContestService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@AllArgsConstructor
@RequestMapping("/api/contests")
@CrossOrigin(origins = "http://localhost:5173")
public class ContestController {

    private final IContestService contestService;


    @PostMapping
    public ResponseEntity<ContestResponseDto> createContest(
            @RequestBody CreateContestRequest request,
            @AuthenticationPrincipal User owner

    ) {
        System.out.println("owner is " + owner);
        ContestResponseDto response =
                contestService.createContest(request,owner);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/me")
    public ResponseEntity<List<ContestResponseDto>> getMyContests(
            @AuthenticationPrincipal User owner
    )
    {
        List<ContestResponseDto> response = contestService.getOwnerContests(owner);
        System.out.println("Sending owned contests...");
        System.out.println(response);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{roomId}")
    public ResponseEntity<ContestDetailDto> getContestDetails(
            @PathVariable String roomId
    ) {
        ContestDetailDto response = contestService.getContestDetails(roomId);
        return ResponseEntity.ok(response);
    }

}
