package com.devarena.models;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Getter
@Setter
@NoArgsConstructor
@Table(
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"question_slug", "origin"})
        }
)
@Entity
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID questionId;

    @ManyToMany(mappedBy = "questions")
    private List<Contest> contests = new ArrayList<>();

    @Column(nullable = false)
    private String questionSlug;

    private String title;

    @ManyToOne
    @JoinColumn(name = "owner_id")
    private User owner;

    @ManyToMany
    @JoinTable(
            name="modifiers_questions",
            joinColumns = @JoinColumn(name = "question_id"),
            inverseJoinColumns = @JoinColumn(name = "modifier_id")
    )
    private List<User> modifiers = new ArrayList<>();

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private QuestionDifficulty difficulty;

    private Integer score;

    @Column(columnDefinition = "TEXT")
    private String constraints;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "sample_testcases", columnDefinition = "jsonb")
    private List<Testcase> sampleTestcases = new ArrayList<>();

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "hidden_testcases", columnDefinition = "jsonb")
    private List<Testcase> hiddenTestcases = new ArrayList<>();

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "function_templates", columnDefinition = "jsonb")
    private Map<String, String> functionTemplates;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "main_function", columnDefinition = "jsonb")
    private Map<String, String> mainFunction;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private QuestionOrigin origin = QuestionOrigin.OWN;


    @PrePersist
    void init() {
        if (origin == null) origin = QuestionOrigin.OWN;
    }
}