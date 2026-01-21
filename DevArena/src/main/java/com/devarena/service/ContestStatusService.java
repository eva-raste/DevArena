package com.devarena.service;

import com.devarena.dtos.contests.ContestStatusEvent;
import com.devarena.models.ContestStatus;
import com.devarena.repositories.IContestRepo;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ContestStatusService {

    private final IContestRepo contestRepo;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public void startContest(UUID contestId) {
        contestRepo.findById(contestId).ifPresent(contest -> {

            LocalDateTime now = LocalDateTime.now();

            if (contest.getStatus() == ContestStatus.SCHEDULED &&
                    contest.getStartTime() != null &&
                    !now.isBefore(contest.getStartTime())) {

                contest.setStatus(ContestStatus.LIVE);

                messagingTemplate.convertAndSend(
                        "/topic/contests",
                        new ContestStatusEvent(
                                contestId,
                                ContestStatus.LIVE,
                                now
                        )
                );
            }
        });
    }

    @Transactional
    public void endContest(UUID contestId) {
        contestRepo.findById(contestId).ifPresent(contest -> {

            LocalDateTime now = LocalDateTime.now();

            if (contest.getStatus() != ContestStatus.ENDED &&
                    contest.getEndTime() != null &&
                    !now.isBefore(contest.getEndTime())) {

                contest.setStatus(ContestStatus.ENDED);

                messagingTemplate.convertAndSend(
                        "/topic/contests",
                        new ContestStatusEvent(
                                contestId,
                                ContestStatus.ENDED,
                                now
                        )
                );
            }
        });
    }
}

