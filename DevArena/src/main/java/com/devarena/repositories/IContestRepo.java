package com.devarena.repositories;

import com.devarena.dtos.ContestResponseDto;
import com.devarena.models.Contest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface IContestRepo extends JpaRepository<Contest, UUID> {

    Optional<Contest> findByRoomId(String roomid);

    boolean existsByRoomId(String roomId);

//    List<Contest> findByVisibilityIsPublic();
}
