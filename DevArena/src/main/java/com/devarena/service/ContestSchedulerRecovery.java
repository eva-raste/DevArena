package com.devarena.service;

import com.devarena.dtos.ContestStatusEvent;
import com.devarena.models.Contest;
import com.devarena.models.ContestStatus;
import com.devarena.repositories.IContestRepo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class ContestSchedulerRecovery {

    private final IContestRepo contestRepo;
    private final ContestTaskScheduler contestTaskScheduler;
    private final SimpMessagingTemplate messagingTemplate;

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void recoverOnStartup() {

        LocalDateTime now = LocalDateTime.now();
        List<Contest> contests = contestRepo.findAll();

        log.info("Recovery started. Found {} contests.", contests.size());

        for (Contest contest : contests) {

            ContestStatus correctStatus;

            // Determine correct status based on time
            if (contest.getEndTime() != null &&
                    !now.isBefore(contest.getEndTime())) {

                correctStatus = ContestStatus.ENDED;

            } else if (contest.getStartTime() != null &&
                    now.isBefore(contest.getStartTime())) {

                correctStatus = ContestStatus.SCHEDULED;

            } else {
                correctStatus = ContestStatus.LIVE;
            }

            //  Fix DB if status is wrong
            if (contest.getStatus() != correctStatus) {

                contest.setStatus(correctStatus);

                messagingTemplate.convertAndSend(
                        "/topic/contests",
                        new ContestStatusEvent(
                                contest.getContestId(),
                                correctStatus,
                                now
                        )
                );

                log.info(
                        "Recovered contest {} → {}",
                        contest.getContestId(),
                        correctStatus
                );
            }

            // 3️⃣ Re-register future schedulers
            contestTaskScheduler.scheduleContest(contest);
        }

        contestRepo.flush();

        log.info("Recovery completed.");
    }
}
