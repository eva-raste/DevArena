package com.devarena.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
        name = "submissions",
        indexes = {
                @Index(name = "idx_contest", columnList = "roomId"),
                @Index(name = "idx_user_contest", columnList = "userId, roomId"),
                @Index(name = "idx_contest_question", columnList = "roomId, questionSlug")
        }
)
public class Submission {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID submissionId;

    private UUID userId;
    private String roomId;
    private String questionSlug;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String code;


    private LocalDateTime submittedAt;

    @Enumerated(EnumType.STRING)
    private Verdict verdict;

    private Integer score;

}

