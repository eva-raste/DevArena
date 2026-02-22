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

    Page<Contest> findByDeletedFalseAndOwnerOrModifiersContaining(
            User owner,
            User modifier,
            Pageable pageable
    );

    Page<Contest> findByDeletedFalseAndVisibility(ContestVisibility contestVisibility, Pageable pageable);

    Page<Contest> findByDeletedFalseAndVisibilityAndStatus(ContestVisibility contestVisibility, ContestStatus status, Pageable pageable);

    Page<Contest> findAllByOwnerAndStatusAndDeletedFalse(User owner, ContestStatus status, Pageable pageable);

    @Query("""
        SELECT DISTINCT c
        FROM Contest c
        JOIN Submission s ON s.roomId = c.roomId
        WHERE s.userId = :userId
        ORDER BY c.startTime DESC
    """)
    Page<Contest> recentAttended(UUID userId, Pageable pageable);

    Optional<Contest> findByRoomId(String roomId);

    Page<Contest> findAllByOwnerOrModifiersAndStatusAndDeletedFalse(User owner, User currentUser, ContestStatus status, Pageable pageable);

    @Query("""
    SELECT c FROM Contest c
    WHERE c.deleted = false
    AND (c.owner = :user OR :user MEMBER OF c.modifiers)
""")
    Page<Contest> findAccessibleContests(
            @Param("user") User user,
            Pageable pageable
    );

    @Query("""
    SELECT c FROM Contest c
    WHERE c.deleted = false
    AND c.status = :status
    AND (c.owner = :user OR :user MEMBER OF c.modifiers)
""")
    Page<Contest> findAccessibleContestsByStatus(
            @Param("user") User user,
            @Param("status") ContestStatus status,
            Pageable pageable
    );

}
