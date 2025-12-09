package com.devarena.models;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;



@Data
@NoArgsConstructor
@AllArgsConstructor
public class Contest {
    private UUID contestId;
    private UUID creatorId;
    private String title;
    private String roomId;
//  private boolean isPrivate;
    private List<Question> questions;
   // private Leaderboard leaderboard;
    private LocalDateTime startTime;
    private LocalDateTime endTime;

}
