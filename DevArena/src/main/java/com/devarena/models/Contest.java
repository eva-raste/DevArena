package com.devarena.models;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import com.devarena.dtos.contests.CreateContestRequest;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;


@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(
        indexes = {
                @Index(
                        name = "idx_contest_status_start",
                        columnList = "status,startTime"
                ),
                @Index(
                        name = "idx_contest_status_end",
                        columnList = "status,endTime"
                )
        }
)
public class Contest
{
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID contestId;

    @ManyToOne
    @JoinColumn(name = "owner_id",nullable = false)
    private User owner;

    @ManyToMany
    @JoinTable(name = "modifiers_contests",
            joinColumns = @JoinColumn(name="contest_id"),
            inverseJoinColumns = @JoinColumn(name="modifier_id"))
    private List<User> modifiers = new ArrayList<>();

    @ManyToMany
    @JoinTable(name = "attendees_contests",
            joinColumns = @JoinColumn(name="contest_id"),
            inverseJoinColumns = @JoinColumn(name="attendee_id"))
    private List<User> attendees = new ArrayList<>();

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
    private ContestVisibility visibility = ContestVisibility.PUBLIC;

    @Column(columnDefinition = "TEXT")
    private String instructions;


    @Enumerated(EnumType.STRING)
    private ContestStatus status = ContestStatus.LIVE;

    private boolean deleted = false;

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
        System.out.println("Owner is " + owner);
        contest.setOwner(owner);
        contest.getModifiers().add(owner);
        contest.status = ContestStatus.SCHEDULED;

        contest.addQuestions(questions);
        System.out.println("Creating contest : \n" + contest);
        return contest;
    }



    public void addQuestions(List<Question> questions) {
        this.questions.addAll(questions);
    }


}