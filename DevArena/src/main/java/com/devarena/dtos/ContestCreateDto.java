package com.devarena.dtos;

import com.devarena.models.Question;
import com.devarena.models.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ContestCreateDto {

    private User owner;

    private String title;

    private List<Question> questions;

    private LocalDateTime startTime;
    private LocalDateTime endTime;
}
