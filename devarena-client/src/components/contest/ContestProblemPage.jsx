import { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import {
  fetchMyContestScore,
  fetchAcceptedQuestions,
} from "../../apis/contest-api";
import getDifficultyColor from "../helpers/colorDifficulty";

export default function ContestProblemsPage() {
  const navigate = useNavigate();
  const { contest } = useOutletContext();

  const [myScore, setMyScore] = useState(null);
  const [acceptedQuestions, setAcceptedQuestions] = useState([]);

  useEffect(() => {
    if (!contest?.roomId) return;

    fetchMyContestScore(contest.roomId)
      .then(setMyScore)
      .catch(() => {});
  }, [contest]);

  useEffect(() => {
    if (!contest?.roomId) return;

    fetchAcceptedQuestions(contest.roomId)
      .then(setAcceptedQuestions)
      .catch(() => {});
  }, [contest, myScore]);

  const status = contest.status;

  return (
    <>
      {myScore !== null && (
        <div className="text-sm font-semibold text-primary">
          My Total Score: {myScore}
        </div>
      )}

      {contest.instructions && (
        <div className="border rounded-xl p-4">
          <h3 className="font-semibold mb-1">Instructions</h3>
          <p className="whitespace-pre-line text-muted-foreground">
            {contest.instructions}
          </p>
        </div>
      )}

      {status === "LIVE" || status === "ENDED" ? (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Questions</h2>

          {contest.questions
            .slice()
            .sort((a, b) => a.orderIndex - b.orderIndex)
            .map((cq, index) => {
              const q = cq.question;

              return (
                <div
                  key={q.questionSlug}
                  onClick={() =>
                    navigate(
                      `/contests/${contest.roomId}/questions/${q.questionSlug}`
                    )
                  }
                  className="cursor-pointer border rounded-xl p-4 hover:bg-accent/40"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">
                      {index + 1}. {q.title}
                    </h3>

                    <div className="flex items-center gap-3">
                      {acceptedQuestions.includes(q.questionSlug) && (
                        <span className="text-green-600 text-2xl font-bold">
                          ✔
                        </span>
                      )}

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${getDifficultyColor(
                          q.difficulty
                        )}`}
                      >
                        {q.difficulty}
                      </span>
                    </div>
                  </div>

                  <p className="mt-2 text-sm text-muted-foreground">
                    Score: {cq.score}
                  </p>
                </div>
              );
            })}
        </div>
      ) : (
        <div className="text-warning font-semibold">
          Contest is not live yet
        </div>
      )}
    </>
  );
}
