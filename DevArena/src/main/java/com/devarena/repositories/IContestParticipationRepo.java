package com.devarena.repositories;

import com.devarena.dtos.leaderboard.LeaderboardProjection;
import com.devarena.models.Contest;
import com.devarena.models.ContestParticipation;
import com.devarena.models.User;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

public interface IContestParticipationRepo
        extends JpaRepository<ContestParticipation, UUID> {

    Optional<ContestParticipation>
    findByContest_ContestIdAndUser_UserId(UUID contestId, UUID userId);

    @Query(value = """
        SELECT
            cp.user_id as userId,
            u.display_name as username,
            cp.total_score as totalScore,
            cp.solved_count as solvedCount,
            cp.first_accepted_at as firstAcceptedAt,
            cp.last_accepted_at as lastAcceptedAt
        FROM contest_participation cp
        JOIN users u ON u.user_id = cp.user_id
        WHERE cp.contest_id = :contestId
        ORDER BY
            cp.total_score DESC,
            cp.last_accepted_at ASC,
            cp.first_accepted_at ASC
        """,
            countQuery = """
            SELECT COUNT(*)
            FROM contest_participation cp
            WHERE cp.contest_id = :contestId
        """,
            nativeQuery = true)
    Page<LeaderboardProjection> getLeaderboard(
            @Param("contestId") UUID contestId,
            Pageable pageable
    );


    @Query(value = """
        SELECT COUNT(*) + 1
        FROM contest_participation cp
        WHERE cp.contest_id = :contestId
        AND (
            cp.total_score > :score
            OR (
                cp.total_score = :score
                AND cp.last_accepted_at < :lastAccepted
            )
            OR (
                cp.total_score = :score
                AND cp.last_accepted_at = :lastAccepted
                AND cp.first_accepted_at < :firstAccepted
            )
        )
        """,
            nativeQuery = true)
    int calculateRank(
            @Param("contestId") UUID contestId,
            @Param("score") int score,
            @Param("lastAccepted") LocalDateTime lastAccepted,
            @Param("firstAccepted") LocalDateTime firstAccepted
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<ContestParticipation> findByContestAndUser(Contest contest, User user);
}
