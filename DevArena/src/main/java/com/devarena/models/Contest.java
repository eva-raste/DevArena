package com.devarena.models;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import com.devarena.dtos.CreateContestRequest;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;


@Getter
@Setter
@NoArgsConstructor
@Entity
public class Contest
{
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID contestId;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User owner;

    @ManyToMany(mappedBy = "attendedContests")
    private List<User> participants;

    private String title;

    @Column(unique = true,nullable = false)
    private String roomId;

    @ManyToMany
    @JoinTable(name="contests_questions",
            joinColumns = @JoinColumn(name = "contest_id"),
            inverseJoinColumns = @JoinColumn(name = "question_id"))
    private List<Question> questions = new ArrayList<>();
    // private Leaderboard leaderboard;

    @Enumerated(EnumType.STRING)
    private ContestVisibility visibility;

    @Column(columnDefinition = "TEXT")
    private String instructions;


    @Enumerated(EnumType.STRING)
    private ContestStatus status;


    private LocalDateTime startTime;
    private LocalDateTime endTime;

    @CreationTimestamp
    private Instant createdAt;

    @UpdateTimestamp
    private Instant updatedAt;


    public static Contest create(
            CreateContestRequest req,
            User owner,
            List<Question> questions,
            String roomId
    ) {
        Contest contest = new Contest();
        contest.title = req.getTitle();
        contest.visibility = req.getVisibility();
        contest.instructions = req.getInstructions();
        contest.startTime = req.getStartTime();
        contest.endTime = req.getEndTime();
        contest.roomId = roomId;
        contest.owner = owner; // null for now
        contest.status = ContestStatus.SCHEDULED;

        contest.addQuestions(questions);
        return contest;
    }


    public void addQuestions(List<Question> questions) {
        for (Question q : questions) {
            this.questions.add(q);
            q.getContests().add(this);
        }
    }
}