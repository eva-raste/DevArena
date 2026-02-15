package com.devarena.models;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import com.devarena.dtos.questions.Testcase;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Getter
@Setter
@NoArgsConstructor
@Table(
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"question_slug"})
        }
)
@Entity
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID questionId;

//    @ManyToMany(mappedBy = "questions")
//    private List<Contest> contests = new ArrayList<>();

    @OneToMany(mappedBy = "question")
    private List<ContestQuestion> contestQuestions = new ArrayList<>();


    @Column(nullable = false,unique = true)
    private String questionSlug;

    @Column(nullable = false)
    private String title;

    @ManyToOne
    @JoinColumn(name = "owner_id",nullable = false)
    private User owner;

    @ManyToMany
    @JoinTable(
            name="modifiers_questions",
            joinColumns = @JoinColumn(name = "question_id"),
            inverseJoinColumns = @JoinColumn(name = "modifier_id")
    )
    private List<User> modifiers = new ArrayList<>();

    @Column(columnDefinition = "TEXT",nullable = false)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private QuestionDifficulty difficulty;

//    private Integer score;

    @Column(columnDefinition = "TEXT",nullable = false)
    private String constraints;

    @Column(nullable = false)
    private boolean deleted = false;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "sample_testcases", columnDefinition = "jsonb")
    private List<Testcase> sampleTestcases = new ArrayList<>();

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "hidden_testcases", columnDefinition = "jsonb")
    private List<Testcase> hiddenTestcases = new ArrayList<>();

    private Instant createdAt=Instant.now();
    private Instant updatedAt=Instant.now();

}