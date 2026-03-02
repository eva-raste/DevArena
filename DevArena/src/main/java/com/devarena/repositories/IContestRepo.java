package com.devarena.repositories;

import com.devarena.dtos.contests.ContestResponseDto;
import com.devarena.dtos.profile.RecentContestDto;
import com.devarena.models.Contest;
import com.devarena.models.ContestStatus;
import com.devarena.models.ContestVisibility;
import com.devarena.models.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface IContestRepo extends JpaRepository<Contest, UUID> {

    Optional<Contest> findByRoomIdAndDeletedFalse(String roomid);

    boolean existsByRoomId(String roomId);

    @Query("""
    SELECT new com.devarena.dtos.contests.ContestResponseDto(
        c.roomId,
        c.title,
         'PARTICIPANT',
        c.visibility,
        c.status,
        c.startTime,
        c.endTime
    )
    FROM Contest c
    WHERE c.deleted = false
    AND c.visibility = :visibility
""")
    Page<ContestResponseDto> findVisibleContestsProjected(
            @Param("visibility") ContestVisibility visibility,
            Pageable pageable
    );

    @Query("""
    SELECT new com.devarena.dtos.contests.ContestResponseDto(
        c.roomId,
        c.title,
        'PARTICIPANT',
        c.visibility,
        c.status,
        c.startTime,
        c.endTime
    )
    FROM Contest c
    WHERE c.deleted = false
    AND c.visibility = :visibility
    AND c.status = :status
""")
    Page<ContestResponseDto> findVisibleContestsByStatusProjected(
            @Param("visibility") ContestVisibility visibility,
            @Param("status") ContestStatus status,
            Pageable pageable
    );

    @Query(
            value = """
        SELECT DISTINCT new com.devarena.dtos.profile.RecentContestDto(
            c.title,
            c.startTime,
            c.status,
            c.roomId
        )
        FROM Contest c
        JOIN Submission s\s
            ON s.roomId = c.roomId AND s.userId = :userId
        ORDER BY c.startTime DESC
   \s""",
            countQuery = """
        SELECT COUNT(DISTINCT c.contestId)
        FROM Contest c
        JOIN Submission s\s
            ON s.roomId = c.roomId AND s.userId = :userId
   \s"""
    )
    Page<RecentContestDto> recentAttended(
            @Param("userId") UUID userId,
            Pageable pageable
    );

    Optional<Contest> findByRoomId(String roomId);

    @Query("""
    SELECT new com.devarena.dtos.contests.ContestResponseDto(
        c.roomId,
        c.title,
        CASE 
            WHEN c.owner.userId = :userId THEN 'OWNER'
            ELSE 'MODERATOR'
        END,
        c.visibility,
        c.status,
        c.startTime,
        c.endTime
    )
    FROM Contest c
    WHERE c.deleted = false
    AND (c.owner.userId = :userId OR :user MEMBER OF c.modifiers)
""")
    Page<ContestResponseDto> findAccessibleContestsProjected(
            @Param("user") User user,
            @Param("userId") UUID userId,
            Pageable pageable
    );

    @Query("""
    SELECT new com.devarena.dtos.contests.ContestResponseDto(
        c.roomId,
        c.title,
        CASE 
            WHEN c.owner.userId = :userId THEN 'OWNER'
            ELSE 'MODERATOR'
        END,
        c.visibility,
        c.status,
        c.startTime,
        c.endTime
    )
    FROM Contest c
    WHERE c.deleted = false
    AND c.status = :status
    AND (c.owner.userId = :userId OR :user MEMBER OF c.modifiers)
""")
    Page<ContestResponseDto> findAccessibleContestsByStatusProjected(
            @Param("user") User user,
            @Param("userId") UUID userId,
            @Param("status") ContestStatus status,
            Pageable pageable
    );

}
