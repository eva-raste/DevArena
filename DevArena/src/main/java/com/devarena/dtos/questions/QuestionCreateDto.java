package com.devarena.dtos.questions;

import com.devarena.models.QuestionDifficulty;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuestionCreateDto {

    @NotBlank
    private String questionSlug;

    @NotBlank
    private String title;

    @NotBlank
    private String description;

    @NotNull
    private QuestionDifficulty difficulty;

    private List<UUID> modifierIds;

    private String constraints;

    @NotEmpty
    private List<Testcase> sampleTestcases;

    @NotEmpty
    private List<Testcase> hiddenTestcases;
}

