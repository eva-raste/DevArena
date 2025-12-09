package com.devarena.models;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;



@Data
@NoArgsConstructor
@AllArgsConstructor
public class Question {
    private UUID questionId;
    private String name;
    private String description;
    private String tag;
    private Integer score;
    private String constraints;
    private List<Testcase> sampleTestcases;
    private List<Testcase> hiddenTestcases;
    private Map<String,String> functionTemplates;
    private Map<String,String> mainFunction;
}
