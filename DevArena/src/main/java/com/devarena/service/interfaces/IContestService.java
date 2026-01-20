package com.devarena.service.interfaces;


import com.devarena.dtos.ContestDetailDto;
import com.devarena.dtos.ContestResponseDto;
import com.devarena.dtos.CreateContestRequest;
import com.devarena.models.User;
import org.springframework.stereotype.Service;

import java.util.List;


public interface IContestService {
    ContestResponseDto createContest(CreateContestRequest request, User owner);

    ContestResponseDto getContestByRoomId(String roomId);

    List<ContestResponseDto> getOwnerContests(User owner);


    ContestDetailDto getContestDetails(String roomId);

    boolean deleteContest(String roomid);
}
