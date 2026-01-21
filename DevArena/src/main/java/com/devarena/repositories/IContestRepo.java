package com.devarena.repositories;

import com.devarena.models.Contest;
import com.devarena.models.ContestStatus;
import com.devarena.models.ContestVisibility;
import com.devarena.models.User;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface IContestRepo extends JpaRepository<Contest, UUID> {

    Optional<Contest> findByRoomIdAndDeletedFalse(String roomid);

    boolean existsByRoomId(String roomId);

    List<Contest> findAllByOwnerAndDeletedFalse(User owner);

    Page<Contest> findAllByOwnerAndDeletedFalse(User owner,Pageable pg);

    Page<Contest> findByDeletedFalseAndVisibility(ContestVisibility contestVisibility, Pageable pageable);

    Page<Contest> findByDeletedFalseAndVisibilityAndStatus(ContestVisibility contestVisibility, ContestStatus status, Pageable pageable);

    Page<Contest> findAllByOwnerAndStatusAndDeletedFalse(User owner, ContestStatus status, Pageable pageable);
}
