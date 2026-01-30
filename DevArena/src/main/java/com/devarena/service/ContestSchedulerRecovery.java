package com.devarena.service;

import com.devarena.dtos.contests.ContestStatusEvent;
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
    private final ContestTaskScheduler scheduler;
    private final ContestLifecycleService lifecycleService;

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void recover() {

        LocalDateTime now = LocalDateTime.now();

        for (Contest contest : contestRepo.findAll()) {

            lifecycleService.reconcileContest(contest, now);
            scheduler.scheduleContest(contest);
        }
    }
}
