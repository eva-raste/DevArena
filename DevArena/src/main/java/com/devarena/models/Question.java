package com.devarena.models;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;



@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class Question
{
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID questionId;

    @ManyToMany(mappedBy = "questions")
    private List<Contest> contests;

    @Column(unique = true,nullable = false)
    private String question_slug;
    private String title;
    private String description;
    private String difficulty;
    private Integer score;
    private String constraints;
    private List<Testcase> sampleTestcases;
    private List<Testcase> hiddenTestcases;
    private Map<String,String> functionTemplates;
    private Map<String,String> mainFunction;
}