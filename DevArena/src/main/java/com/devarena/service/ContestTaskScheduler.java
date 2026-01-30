package com.devarena.service;

import com.devarena.models.Contest;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ContestTaskScheduler {

    private final TaskScheduler taskScheduler;
    private final ContestLifecycleService lifecycleService;
    public void scheduleContest(Contest contest) {

        LocalDateTime now = LocalDateTime.now();

        if (contest.getStartTime() != null &&
                contest.getStartTime().isAfter(now)) {

            taskScheduler.schedule(
                    () -> lifecycleService.startContest(
                            contest.getRoomId(),
                            contest.getStartTime()
                    ),
                    Timestamp.valueOf(contest.getStartTime())
            );

        }

        if (contest.getEndTime() != null &&
                contest.getEndTime().isAfter(now)) {

            taskScheduler.schedule(
                    () -> lifecycleService.endContest(
                            contest.getRoomId(),
                            contest.getEndTime()
                    ),
                    Timestamp.valueOf(contest.getEndTime())
            );

        }
    }
}
