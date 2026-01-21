package com.devarena.controller;


import com.devarena.dtos.contests.ContestDetailDto;
import com.devarena.dtos.contests.ContestResponseDto;
import com.devarena.dtos.contests.CreateContestRequest;
import com.devarena.dtos.contests.EditContestRequestDto;
import com.devarena.models.ContestStatus;
import com.devarena.models.User;
import com.devarena.service.interfaces.IContestService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

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
    public ResponseEntity<Page<ContestResponseDto>> getMyContests(
            @AuthenticationPrincipal User owner,
            @RequestParam(required = false) ContestStatus status,
            @PageableDefault(page = 0, size = 10, sort = "startTime", direction = Sort.Direction.DESC)
            Pageable pageable
    ) {
        return ResponseEntity.ok(
                contestService.getOwnerContests(owner, status, pageable)
        );
    }


    @GetMapping("/{roomId}")
    public ResponseEntity<ContestDetailDto> getContestDetails(
            @PathVariable String roomId
    ) {
        ContestDetailDto response = contestService.getContestDetails(roomId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping
    public ResponseEntity<Void> deleteContest(@RequestParam(name="roomId") String roomId)
    {
        boolean deleted = contestService.deleteContest(roomId);

        if (!deleted) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.noContent().build();
    }

    @GetMapping("/edit-validity")
    public ResponseEntity<Void> checkContestEditValidity(
            @RequestParam String roomId
    ) {
        contestService.assertEditable(roomId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{roomId}")
    public ResponseEntity<ContestDetailDto> updateContest(
            @PathVariable String roomId,
            @Valid @RequestBody EditContestRequestDto dto
    ) {
        ContestDetailDto updated =
                contestService.updateContest(roomId, dto);
        return ResponseEntity.ok(updated);
    }


    @GetMapping("/public")
    public ResponseEntity<Page<ContestResponseDto>> getPublicContests(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) ContestStatus status
    ) {
        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by("startTime").ascending()
        );

        return ResponseEntity.ok(
                contestService.getPublicContests(pageable, status)
        );
    }




}
