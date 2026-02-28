package com.devarena.dtos.leaderboard;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
    @Setter
public class LeaderboardResponseDto {
    private String roomId;

    private int page;
    private int size;

    private long totalElements;
    private int totalPages;

    private List<QuestionMetaDto> questionsMeta;
    private List<LeaderboardEntryDto> content;
}
