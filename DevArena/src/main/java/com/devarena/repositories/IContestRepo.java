package com.devarena.repositories;

import com.devarena.models.Contest;
import com.devarena.models.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface IContestRepo extends JpaRepository<Contest, UUID> {

    Optional<Contest> findByRoomIdAndDeletedFalse(String roomid);

    boolean existsByRoomId(String roomId);

    List<Contest> findAllByOwnerAndDeletedFalse(User owner);

}
