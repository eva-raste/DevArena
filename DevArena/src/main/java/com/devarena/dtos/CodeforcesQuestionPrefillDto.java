package com.devarena.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CodeforcesQuestionPrefillDto {

    private String slug;
    private String title;
    private String description;
    private List<ExampleDto> examples;
}
