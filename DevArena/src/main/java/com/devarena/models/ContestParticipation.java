package com.devarena.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(
        name = "contest_participation",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_contest_user",
                        columnNames = {"contest_id", "user_id"}
                )
        },
        indexes = {
                @Index(
                        name = "idx_leaderboard_sort",
                        columnList = "contest_id,total_score,last_accepted_at,first_accepted_at"
                )
        }
)
public class ContestParticipation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contest_id", nullable = false)
    private Contest contest;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private int totalScore = 0;

    @Column(nullable = false)
    private int solvedCount = 0;

    private LocalDateTime firstAcceptedAt;

    private LocalDateTime lastAcceptedAt;

    @Column(nullable = false)
    private LocalDateTime lastSubmissionAt;

    @CreationTimestamp
    private Instant createdAt;

    @UpdateTimestamp
    private Instant updatedAt;
}
