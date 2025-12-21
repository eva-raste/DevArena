package com.devarena.controller;


import com.devarena.dtos.ContestResponseDto;
import com.devarena.dtos.CreateContestRequest;
import com.devarena.models.User;
import com.devarena.service.IContestService;
import lombok.Data;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@Data
@RequestMapping("/api/contests")
@CrossOrigin(origins = "http://localhost:5173")
public class ContestController {

    private final IContestService contestService;


    @PostMapping
    public ResponseEntity<ContestResponseDto> createContest(
            @RequestBody CreateContestRequest request,
            @AuthenticationPrincipal User owner

    ) {
        ContestResponseDto response =
                contestService.createContest(request,owner);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
