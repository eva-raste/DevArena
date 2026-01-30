package com.devarena.service;

import com.devarena.dtos.contests.ContestStatusEvent;
import com.devarena.models.ContestStatus;
import com.devarena.models.Verdict;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class ContestEventPublisher {

    private final SimpMessagingTemplate messagingTemplate;

    public void publishContestStatus(
            String roomId,
            ContestStatus status,
            LocalDateTime time
    ) {
        messagingTemplate.convertAndSend(
                "/topic/contest/status",
                new ContestStatusEvent(roomId, status, time)
        );
    }

    public void publishSubmissionResult(
            String roomId,
            String questionSlug,
            UUID userId,
            Verdict verdict,
            int score
    ) {
        messagingTemplate.convertAndSend(
                "/topic/contest/" + roomId + "/question/" + questionSlug,
                Map.of(
                        "userId", userId,
                        "verdict", verdict,
                        "score", score
                )
        );
    }
}

