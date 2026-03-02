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
                ),
                @Index(name = "idx_contest_room_id", columnList = "room_id", unique = true)
        }
)
public class Contest
{
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID contestId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id",nullable = false)
    private User owner;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "modifiers_contests",
            joinColumns = @JoinColumn(name="contest_id"),
            inverseJoinColumns = @JoinColumn(name="modifier_id"))
    private List<User> modifiers = new ArrayList<>();

    private String title;

    @Column(unique = true,nullable = false)
    private String roomId;

    @OneToMany(
            mappedBy = "contest",
            cascade = CascadeType.ALL,
            orphanRemoval = true
            ,fetch = FetchType.LAZY
    )
    private List<ContestQuestion> contestQuestions = new ArrayList<>();


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
            String roomId
    ) {
        Contest contest = new Contest();
        contest.title = req.getTitle();
        contest.visibility = req.getVisibility();
        contest.instructions = req.getInstructions();
        contest.startTime = req.getStartTime();
        contest.endTime = req.getEndTime();
        contest.roomId = roomId;
//        System.out.println("Owner is " + owner);
        contest.setOwner(owner);
        contest.getModifiers().add(owner);
        contest.status = ContestStatus.SCHEDULED;

//        System.out.println("Creating contest : \n" + contest);
        return contest;
    }

}