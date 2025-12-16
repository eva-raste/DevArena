package com.devarena.models;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID questionId;

    @ManyToMany(mappedBy = "questions")
    private List<Contest> contests;

    @Column(unique = true, nullable = false)
    private String questionSlug;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String difficulty;

    private Integer score;

    @Column(columnDefinition = "TEXT")
    private String constraints;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "sample_testcases", columnDefinition = "jsonb")
    private List<Testcase> sampleTestcases;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "hidden_testcases", columnDefinition = "jsonb")
    private List<Testcase> hiddenTestcases;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "function_templates", columnDefinition = "jsonb")
    private Map<String, String> functionTemplates;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "main_function", columnDefinition = "jsonb")
    private Map<String, String> mainFunction;
}