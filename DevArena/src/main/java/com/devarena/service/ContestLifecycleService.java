package com.devarena.service;

import com.devarena.models.Contest;
import com.devarena.models.ContestStatus;
import com.devarena.repositories.IContestRepo;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional
public class ContestLifecycleService {

    private final IContestRepo contestRepo;
    private final ContestEventPublisher eventPublisher;

    public void startContest(String roomId, LocalDateTime time) {

        Contest contest = contestRepo
                .findByRoomIdAndDeletedFalse(roomId)
                .orElseThrow();

        if (contest.getStatus() != ContestStatus.SCHEDULED) return;

        contest.setStatus(ContestStatus.LIVE);

        eventPublisher.publishContestStatus(
                roomId,
                ContestStatus.LIVE,
                time
        );
    }

    public void endContest(String roomId, LocalDateTime time) {

        Contest contest = contestRepo
                .findByRoomIdAndDeletedFalse(roomId)
                .orElseThrow();

        if (contest.getStatus() == ContestStatus.ENDED) return;

        contest.setStatus(ContestStatus.ENDED);

        eventPublisher.publishContestStatus(
                roomId,
                ContestStatus.ENDED,
                time
        );
    }

    public void reconcileContest(Contest contest, LocalDateTime now) {

        ContestStatus correct;

        if (contest.getEndTime() != null && !now.isBefore(contest.getEndTime())) {
            correct = ContestStatus.ENDED;
        } else if (contest.getStartTime() != null && now.isBefore(contest.getStartTime())) {
            correct = ContestStatus.SCHEDULED;
        } else {
            correct = ContestStatus.LIVE;
        }

        if (contest.getStatus() != correct) {
            contest.setStatus(correct);

            eventPublisher.publishContestStatus(
                    contest.getRoomId(),
                    correct,
                    now
            );
        }
    }
}

