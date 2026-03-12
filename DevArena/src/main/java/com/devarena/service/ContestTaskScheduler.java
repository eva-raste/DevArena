package com.devarena.service;

import com.devarena.models.Contest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ScheduledFuture;

@Service
@RequiredArgsConstructor
@Slf4j
public class ContestTaskScheduler {

    private final TaskScheduler taskScheduler;
    private final ContestLifecycleService lifecycleService;

    private final Map<String, ScheduledFuture<?>> startTasks = new ConcurrentHashMap<>();
    private final Map<String, ScheduledFuture<?>> endTasks = new ConcurrentHashMap<>();


    public void scheduleContest(Contest contest) {

        String roomId = contest.getRoomId();
        LocalDateTime now = LocalDateTime.now();

        cancelContestTasks(roomId);
        log.info("Now: {}", LocalDateTime.now());
        log.info("Start: {}", contest.getStartTime());
        // ---- Schedule START ----
        if (contest.getStartTime() != null &&
                contest.getStartTime().isAfter(now)) {
            log.info("Now1: {}", LocalDateTime.now());
            log.info("Start1: {}", contest.getStartTime());
            ScheduledFuture<?> startFuture =
                    taskScheduler.schedule(
                            () -> lifecycleService.startContest(
                                    roomId,
                                    contest.getStartTime()
                            ),
                            Timestamp.valueOf(contest.getStartTime())
                    );

            startTasks.put(roomId, startFuture);
        }

        // ---- Schedule END ----
        if (contest.getEndTime() != null &&
                contest.getEndTime().isAfter(now)) {
            log.info("Now2: {}", LocalDateTime.now());
            log.info("End2: {}", contest.getEndTime());
            ScheduledFuture<?> endFuture =
                    taskScheduler.schedule(
                            () -> lifecycleService.endContest(
                                    roomId,
                                    contest.getEndTime()
                            ),
                            Timestamp.valueOf(contest.getEndTime())
                    );

            endTasks.put(roomId, endFuture);
        }
    }


    public void cancelContestTasks(String roomId) {

        ScheduledFuture<?> startFuture = startTasks.remove(roomId);
        if (startFuture != null) {
            startFuture.cancel(false);
        }

        ScheduledFuture<?> endFuture = endTasks.remove(roomId);
        if (endFuture != null) {
            endFuture.cancel(false);
        }
    }
}