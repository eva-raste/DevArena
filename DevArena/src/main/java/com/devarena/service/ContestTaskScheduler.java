package com.devarena.service;

import com.devarena.models.Contest;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ScheduledFuture;

@Service
@RequiredArgsConstructor
public class ContestTaskScheduler {

    private final TaskScheduler taskScheduler;
    private final ContestLifecycleService lifecycleService;

    private final Map<String, ScheduledFuture<?>> startTasks = new ConcurrentHashMap<>();
    private final Map<String, ScheduledFuture<?>> endTasks = new ConcurrentHashMap<>();


    public void scheduleContest(Contest contest) {

        String roomId = contest.getRoomId();
        LocalDateTime now = LocalDateTime.now();

        cancelContestTasks(roomId);

        // ---- Schedule START ----
        if (contest.getStartTime() != null &&
                contest.getStartTime().isAfter(now)) {

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