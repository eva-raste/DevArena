package com.devarena.models;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;



@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class Contest
{
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID contestId;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User owner;

    @ManyToOne
    @JoinColumn(name = "attendee_id")
    private User attendee;

    private String title;

    @Column(unique = true)
    private String roomId;
    // private boolean isPrivate;

    @ManyToMany
    @JoinTable(name="contests_questions",
            joinColumns = @JoinColumn(name = "contest_id"),
            inverseJoinColumns = @JoinColumn(name = "question_id"))
    private List<Question> questions;
    // private Leaderboard leaderboard;

    private LocalDateTime startTime;
    private LocalDateTime endTime;
}