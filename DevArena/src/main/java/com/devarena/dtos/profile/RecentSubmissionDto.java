package com.devarena.dtos.profile;

import com.devarena.models.QuestionDifficulty;
import com.devarena.models.Verdict;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
public class RecentSubmissionDto {
    private UUID submissionId;
    private UUID contestId;
    private UUID questionId;
    private Verdict verdict;
    private LocalDateTime submittedAt;
}


