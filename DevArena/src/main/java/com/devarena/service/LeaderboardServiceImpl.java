package com.devarena.service;

import com.devarena.dtos.leaderboard.*;
import com.devarena.models.*;
import com.devarena.repositories.IContestParticipationRepo;
import com.devarena.repositories.IContestQuestionRepo;
import com.devarena.repositories.IContestRepo;
import com.devarena.repositories.IQuestionAttemptRepo;
import com.devarena.service.interfaces.ILeaderboardService;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
@Service
@Transactional
public class LeaderboardServiceImpl implements ILeaderboardService {

    private final IContestParticipationRepo participationRepo;
    private final IQuestionAttemptRepo attemptRepo;
    private final IContestRepo contestRepo;
    private final IContestQuestionRepo contestQuestionRepo;

    public LeaderboardServiceImpl(
            IContestParticipationRepo participationRepo,
            IQuestionAttemptRepo attemptRepo,
            IContestRepo contestRepo, IContestQuestionRepo contestQuestionRepo
    ) {
        this.participationRepo = participationRepo;
        this.attemptRepo = attemptRepo;
        this.contestRepo = contestRepo;
        this.contestQuestionRepo = contestQuestionRepo;
    }


    @Transactional
    @Override
    public void updateLeaderboardAfterSubmission(
            Contest contest,
            Question question,
            User user,
            Verdict verdict
    ) {

        LocalDateTime now = LocalDateTime.now();

        // Get or create participation (race-condition safe)
        ContestParticipation participation =
                participationRepo
                        .findByContestAndUser(contest, user)
                        .orElseGet(() -> {
                            try {
                                ContestParticipation cp = new ContestParticipation();
                                cp.setContest(contest);
                                cp.setUser(user);
                                cp.setTotalScore(0);
                                cp.setSolvedCount(0);
                                cp.setLastSubmissionAt(now);
                                return participationRepo.saveAndFlush(cp);
                            } catch (DataIntegrityViolationException ex) {
                                return participationRepo
                                        .findByContestAndUser(contest, user)
                                        .orElseThrow();
                            }
                        });

        // Always update last submission time
        participation.setLastSubmissionAt(now);

        // Get or create question attempt
        QuestionAttempt attempt =
                attemptRepo
                        .findByParticipationAndQuestion(participation, question)
                        .orElseGet(() -> {
                            QuestionAttempt qa = new QuestionAttempt();
                            qa.setParticipation(participation);
                            qa.setQuestion(question);
                            qa.setWrongAttempts(0);
                            return attemptRepo.save(qa);
                        });

        //  If already accepted → no scoring change
        if (attempt.getAcceptedAt() != null) {
            return;
        }

        //  If not accepted verdict → increment wrong attempts only
        if (verdict != Verdict.ACCEPTED) {
            attempt.setWrongAttempts(
                    attempt.getWrongAttempts() + 1
            );
            return;
        }

        // ACCEPTED → update attempt
        attempt.setAcceptedAt(now);

        //  Fetch question score from contest mapping
        Integer score = contestQuestionRepo
                .findScoreByContestAndQuestion(
                        contest.getContestId(),
                        question.getQuestionId()
                );

        // Update participation totals
        participation.setTotalScore(
                participation.getTotalScore() + score
        );

        participation.setSolvedCount(
                participation.getSolvedCount() + 1
        );

        // Update ranking timestamps
        if (participation.getFirstAcceptedAt() == null) {
            participation.setFirstAcceptedAt(now);
        }

        participation.setLastAcceptedAt(now);
    }

    // ==========================
    // LEADERBOARD PAGE
    // ==========================

    @Transactional(readOnly = true)
    @Override
    public LeaderboardResponseDto getLeaderboard(
            String roomId,
            int page,
            int size
    ) {

        Contest contest = contestRepo
                .findByRoomIdAndDeletedFalse(roomId)
                .orElseThrow(() -> new RuntimeException("Contest not found"));

        Pageable pageable = PageRequest.of(page, size);

        Page<LeaderboardProjection> projectionPage =
                participationRepo.getLeaderboard(
                        contest.getContestId(),
                        pageable
                );

        int baseRank = page * size;

        List<UUID> userIds = new ArrayList<>();
        for (LeaderboardProjection p : projectionPage.getContent()) {
            userIds.add(p.getUserId());
        }

        List<QuestionAttempt> allAttempts =
                attemptRepo.findAllForLeaderboardPage(
                        contest.getContestId(),
                        userIds
                );

        Map<UUID, Map<UUID, QuestionAttempt>> attemptMap =
                allAttempts.stream()
                        .collect(Collectors.groupingBy(
                                qa -> qa.getParticipation()
                                        .getUser()
                                        .getUserId(),
                                Collectors.toMap(
                                        qa -> qa.getQuestion().getQuestionId(),
                                        qa -> qa
                                )
                        ));

        List<LeaderboardEntryDto> entries = new ArrayList<>();

        int index = 0;

        for (LeaderboardProjection p : projectionPage.getContent()) {

            LeaderboardEntryDto dto =
                    mapProjectionToDto(p, contest, attemptMap);

            dto.setRank(baseRank + index + 1);
            entries.add(dto);
            index++;
        }

        LeaderboardResponseDto response = new LeaderboardResponseDto();
        response.setRoomId(roomId);
        response.setPage(page);
        response.setSize(size);
        response.setTotalElements(projectionPage.getTotalElements());
        response.setTotalPages(projectionPage.getTotalPages());
        response.setQuestionsMeta(
                contest.getContestQuestions()
                        .stream()
                        .map(cq -> {
                            QuestionMetaDto meta = new QuestionMetaDto();
                            meta.setQuestionSlug(cq.getQuestion().getQuestionSlug());
                            meta.setTitle(cq.getQuestion().getTitle());
                            meta.setScore(cq.getScore());
                            return meta;
                        })
                        .toList()
        );
        response.setContent(entries);

        return response;
    }

    // ==========================
    // MY RANK (TRUE COMPETITION RANK)
    // ==========================

    @Transactional(readOnly = true)
    @Override
    public LeaderboardRowDto getMyLeaderboardRow(
            String roomId,
            UUID userId
    ) {

        Contest contest = contestRepo
                .findByRoomIdAndDeletedFalse(roomId)
                .orElseThrow(() -> new RuntimeException("Contest not found"));

        ContestParticipation participation =
                participationRepo
                        .findByContest_ContestIdAndUser_UserId(
                                contest.getContestId(),
                                userId
                        )
                        .orElse(null);

        if (participation == null) {
            return null;
        }

        int rank = participationRepo.calculateRank(
                contest.getContestId(),
                participation.getTotalScore(),
                participation.getLastAcceptedAt(),
                participation.getFirstAcceptedAt()
        );

        // Fetch all attempts for this participation
        List<QuestionAttempt> attempts =
                attemptRepo.findByParticipationId(
                        participation.getId()
                );

        List<QuestionTimeDto> questionDtos = attempts.stream()
                .filter(a -> a.getAcceptedAt() != null)
                .map(a -> new QuestionTimeDto(
                        a.getQuestion().getQuestionSlug(),
                        Duration.between(
                                contest.getStartTime(),
                                a.getAcceptedAt()
                        ).toSeconds()
                ))
                .toList();

        return buildRowDto(
                participation,
                contest,
                rank,
                questionDtos
        );
    }

    private LeaderboardRowDto buildRowDto(
            ContestParticipation participation,
            Contest contest,
            int rank,
            List<QuestionTimeDto> questionDtos) {

        LocalDateTime contestStart = contest.getStartTime();

        Long firstSeconds = null;
        Long lastSeconds = null;

        if (participation.getFirstAcceptedAt() != null) {
            firstSeconds = Duration.between(
                    contestStart,
                    participation.getFirstAcceptedAt()
            ).toSeconds();
        }

        if (participation.getLastAcceptedAt() != null) {
            lastSeconds = Duration.between(
                    contestStart,
                    participation.getLastAcceptedAt()
            ).toSeconds();
        }

        return new LeaderboardRowDto(
                rank,
                participation.getUser().getDisplayName(),
                participation.getTotalScore(),
                participation.getSolvedCount(),
                firstSeconds,
                lastSeconds,
                questionDtos
        );
    }
    private LeaderboardEntryDto mapProjectionToDto(
            LeaderboardProjection p,
            Contest contest,
            Map<UUID, Map<UUID, QuestionAttempt>> attemptMap
    ) {

        LeaderboardEntryDto dto = new LeaderboardEntryDto();

        dto.setUsername(p.getUsername());
        dto.setTotalScore(p.getTotalScore());
        dto.setSolvedCount(p.getSolvedCount());

        LocalDateTime start = contest.getStartTime();

        if (p.getFirstAcceptedAt() != null) {
            dto.setFirstAcceptedSeconds(
                    (int) Duration.between(
                            start,
                            p.getFirstAcceptedAt()
                    ).toSeconds()
            );
        }

        if (p.getLastAcceptedAt() != null) {
            dto.setLastAcceptedSeconds(
                    (int) Duration.between(
                            start,
                            p.getLastAcceptedAt()
                    ).toSeconds()
            );
        }

        Map<UUID, QuestionAttempt> userAttempts =
                attemptMap.getOrDefault(p.getUserId(), Map.of());

        List<QuestionResultDto> questionResults = new ArrayList<>();

        for (ContestQuestion cq : contest.getContestQuestions()) {

            QuestionResultDto qr = new QuestionResultDto();
            qr.setQuestionSlug(
                    cq.getQuestion().getQuestionSlug()
            );

            QuestionAttempt attempt =
                    userAttempts.get(cq.getQuestion().getQuestionId());

            if (attempt != null && attempt.getAcceptedAt() != null) {
                qr.setAcceptedSeconds(
                        (int) Duration.between(
                                start,
                                attempt.getAcceptedAt()
                        ).toSeconds()
                );
            }

            questionResults.add(qr);
        }

        dto.setQuestions(questionResults);

        return dto;
    }}
