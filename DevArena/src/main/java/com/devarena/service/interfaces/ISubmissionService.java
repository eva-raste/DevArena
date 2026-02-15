package com.devarena.service.interfaces;

import com.devarena.models.Submission;
import com.devarena.models.User;
import com.devarena.models.Verdict;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface ISubmissionService {
    public Map<String, Object> run(Map<String, Object> body);

    public Map<String, Object> submit(
            String roomId,
            String questionSlug,
            String code,
            User user
    );

    public List<Submission> getSubmissions(
            String questionSlug,
            String roomId,
            User user
    );

    public int getMyTotalScore(UUID userId, String roomId);

    public List<String> getAcceptedQuestionSlugs(UUID userId, String roomId);

}
