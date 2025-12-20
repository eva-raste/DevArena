package com.devarena.service;


import com.devarena.dtos.ContestResponseDto;
import com.devarena.dtos.CreateContestRequest;

public interface IContestService {
    ContestResponseDto createContest(CreateContestRequest request);

    ContestResponseDto getContestByRoomId(String roomId);

//    Iterable<ContestResponseDto> getAllPublicContests();

}
