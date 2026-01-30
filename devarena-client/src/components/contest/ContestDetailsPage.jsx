import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchContestByIdApi,fetchMyContestScore ,fetchAcceptedQuestions } from "../../apis/contest-api";
import { useContestSocket } from "../../websocket/useContestSocket";
import getDifficultyColor from "../helpers/colorDifficulty";


const STATUS_LABELS = {
  DRAFT: "DRAFT",
  SCHEDULED: "UPCOMING",
  LIVE: "RUNNING",
  ENDED: "ENDED",
};

const formatRemaining = (targetMs, nowMs) => {
  const diff = Math.max(0, targetMs - nowMs);
  if (diff === 0) return "00s";

  const units = [
    { label: "d", ms: 1000 * 60 * 60 * 24 },
    { label: "h", ms: 1000 * 60 * 60 },
    { label: "m", ms: 1000 * 60 },
    { label: "s", ms: 1000 },
  ];

  let remaining = diff;
  const parts = [];

  for (const u of units) {
    const v = Math.floor(remaining / u.ms);
    if (v > 0) {
      parts.push(`${v}${u.label}`);
      remaining %= u.ms;
    }
  }

  return parts.join(" ");
};

/* ---------- component ---------- */

export default function ContestDetailsPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const [contest, setContest] = useState(null);
  const [error, setError] = useState(null);
  const [myScore, setMyScore] = useState(null);
  const [serverOffset, setServerOffset] = useState(0);
  const [now, setNow] = useState(Date.now());
  const [acceptedQuestions, setAcceptedQuestions] = useState([]);

  useEffect(() => {
    fetchContestByIdApi(roomId)
      .then((data) => {
        console.log("[REST] Contest loaded:", data);
        setContest(data);
      })
      .catch((e) =>
        setError(e.message || "Failed to load contest")
      );
  }, [roomId]);

    useEffect(() => {
      if (!contest?.roomId) return;

      fetchMyContestScore(contest.roomId)
        .then(setMyScore)
        .catch(() => {});
    }, [contest]);

  useEffect(() => {
    if (!contest?.roomId) return;

    fetchAcceptedQuestions(contest.roomId)
       .then((data) => {
               console.log(data);
               setAcceptedQuestions(data);
             })
      .catch(() => {});
  }, [contest, myScore]);


  const handleSocketEvent = useCallback((event) => {
    console.log("[WS] Event received:", event);

    if (event.serverTime) {
      setServerOffset(
        new Date(event.serverTime).getTime() - Date.now()
      );
    }

    setContest((prev) => {
      if (!prev) return prev;
      if (event.roomId !== prev.roomId) return prev;

      return {
        ...prev,
        status: event.status,
      };
    });
  }, []);

  useContestSocket({ onEvent: handleSocketEvent });

  useEffect(() => {
    const t = setInterval(() => {
      setNow(Date.now() + serverOffset);
    }, 1000);

    return () => clearInterval(t);
  }, [serverOffset]);


  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-destructive">
        {error}
      </div>
    );
  }

  if (!contest) {
    return <div className="min-h-screen" />;
  }


  const status = contest.status;
  const label = STATUS_LABELS[status] ?? status;

  let targetMs = null;
  if (status === "SCHEDULED" && contest.startTime) {
    targetMs = new Date(contest.startTime).getTime();
  } else if (status === "LIVE" && contest.endTime) {
    targetMs = new Date(contest.endTime).getTime();
  }

  return (
    <main className="min-h-screen px-6 py-10">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* ---------- Header ---------- */}
        <div className="border rounded-xl p-6">
          <h1 className="text-3xl font-bold">{contest.title}</h1>

          <div className="mt-4 flex gap-6 text-sm text-muted-foreground">
            <span>Start: {contest.startTime}</span>
            <span>End: {contest.endTime}</span>
            <span>Status: {label}</span>
          </div>
           {myScore !== null && (
             <div className="mt-2 text-sm font-semibold text-primary">
               My Total Score: {myScore}
             </div>
           )}

          {/* Timer */}
          {targetMs && (
            <div className="mt-4 font-mono text-primary">
              {status === "SCHEDULED"
                ? "Starts in: "
                : "Ends in: "}
              {formatRemaining(targetMs, now)}
            </div>
          )}

          {status === "ENDED" && (
            <div className="mt-4 font-mono text-primary">
              Ends in: 00s
            </div>
          )}
        </div>

        {/* ---------- Instructions ---------- */}
        {contest.instructions && (
          <div className="border rounded-xl p-4">
            <h3 className="font-semibold mb-1">Instructions</h3>
            <p className="whitespace-pre-line text-muted-foreground">
              {contest.instructions}
            </p>
          </div>
        )}

        {/* ---------- Questions ---------- */}
        {status === "LIVE" || status === "ENDED" ? (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Questions</h2>

            {contest.questions.map((q, index) => (
              <div
                key={q.questionSlug}
                onClick={() =>
                  navigate(`/contests/${contest.roomId}/questions/${q.questionSlug}`)
                }
                className="cursor-pointer border rounded-xl p-4 hover:bg-accent/40"
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">
                    {index + 1}. {q.title}
                  </h3>

                  <div className="flex items-center gap-3">
                    {acceptedQuestions.includes(q.questionSlug) && (
                      <span className="text-green-600 text-2xl font-bold">✔</span>
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
                  Score: {q.score}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-warning font-semibold">
            Contest is not live yet
          </div>
        )}

      </div>
    </main>
  );
}
