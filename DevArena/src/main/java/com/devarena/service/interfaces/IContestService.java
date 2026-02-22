package com.devarena.service.interfaces;


import com.devarena.dtos.contests.ContestDetailDto;
import com.devarena.dtos.contests.ContestResponseDto;
import com.devarena.dtos.contests.CreateContestRequest;
import com.devarena.dtos.contests.EditContestRequestDto;
import com.devarena.models.Contest;
import com.devarena.models.ContestStatus;
import com.devarena.models.User;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;


public interface IContestService {
    ContestResponseDto createContest(CreateContestRequest request, User owner);

//    ContestResponseDto getContestByRoomId(String roomId);

    ContestResponseDto getContestByRoomId(String roomId, User currentUser);

    public Page<ContestResponseDto> getOwnerContests(
            User owner,
            ContestStatus status,
            Pageable pageable
    );
//    ContestDetailDto getContestDetails(String roomId);

    boolean deleteContest(String roomid, User owner);

    ContestDetailDto getContestDetails(String roomId, User currentUser);

    Contest assertEditable(String roomId, User owner);

    ContestDetailDto updateContest(String roomId, @Valid EditContestRequestDto dto, User owner);

    public Page<ContestResponseDto> getPublicContests(
            Pageable pageable,
            ContestStatus status
    );

    void removeModifier(String roomId, String email, String name);
}
