package com.devarena.service;


import com.devarena.dtos.ContestResponseDto;
import com.devarena.dtos.CreateContestRequest;
import com.devarena.models.User;

public interface IContestService {
    ContestResponseDto createContest(CreateContestRequest request, User owner);

    ContestResponseDto getContestByRoomId(String roomId);

//    Iterable<ContestResponseDto> getAllPublicContests();

}
