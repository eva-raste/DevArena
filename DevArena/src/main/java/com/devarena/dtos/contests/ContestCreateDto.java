package com.devarena.dtos.contests;

import com.devarena.models.Question;
import com.devarena.models.User;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ContestCreateDto {

    @NotNull
    private User owner;

    @NotEmpty
    private String title;

    @NotNull
    private List<Question> questions;

    private LocalDateTime startTime;
    private LocalDateTime endTime;
}
