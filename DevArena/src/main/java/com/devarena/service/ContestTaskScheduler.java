package com.devarena.service;

import com.devarena.dtos.ContestStatusEvent;
import com.devarena.models.Contest;
import com.devarena.models.ContestStatus;
import com.devarena.repositories.IContestRepo;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ContestTaskScheduler {

    private final TaskScheduler taskScheduler;
    private final ContestStatusService contestStatusService;

    public void scheduleContest(Contest contest) {

        LocalDateTime now = LocalDateTime.now();

        if (contest.getStartTime() != null &&
                contest.getStartTime().isAfter(now)) {

            taskScheduler.schedule(
                    () -> contestStatusService.startContest(contest.getContestId()),
                    Timestamp.valueOf(contest.getStartTime())
            );
        }

        if (contest.getEndTime() != null &&
                contest.getEndTime().isAfter(now)) {

            taskScheduler.schedule(
                    () -> contestStatusService.endContest(contest.getContestId()),
                    Timestamp.valueOf(contest.getEndTime())
            );
        }
    }
}
