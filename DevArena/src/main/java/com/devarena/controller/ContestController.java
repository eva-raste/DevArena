package com.devarena.controller;


import com.devarena.dtos.ContestResponseDto;
import com.devarena.dtos.CreateContestRequest;
import com.devarena.service.IContestService;
import lombok.Data;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Data
@RequestMapping("/api/contests")
public class ContestController {

    private final IContestService contestService;


    @PostMapping
    public ResponseEntity<ContestResponseDto> createContest(
            @RequestBody CreateContestRequest request
    ) {
        ContestResponseDto response =
                contestService.createContest(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
