import { useEffect, useState, useCallback } from "react";
import { useParams, Outlet, useNavigate, useLocation } from "react-router-dom";
import { fetchContestByIdApi } from "../../apis/contest-api";
import { useContestSocket } from "../../websocket/useContestSocket";

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

export default function ContestLayout() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [contest, setContest] = useState(null);
  const [error, setError] = useState(null);
  const [serverOffset, setServerOffset] = useState(0);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    fetchContestByIdApi(roomId)
      .then(setContest)
      .catch((e) => setError(e.message || "Failed to load contest"));
  }, [roomId]);

  const handleSocketEvent = useCallback((event) => {
    if (event.serverTime) {
      setServerOffset(new Date(event.serverTime).getTime() - Date.now());
    }

    setContest((prev) => {
      if (!prev) return prev;
      if (event.roomId !== prev.roomId) return prev;
      return { ...prev, status: event.status };
    });
  }, []);

  useContestSocket({ onEvent: handleSocketEvent });

  useEffect(() => {
    if (contest?.status === "ENDED") return;

    const t = setInterval(() => {
      setNow(Date.now() + serverOffset);
    }, 1000);

    return () => clearInterval(t);
  }, [serverOffset, contest?.status]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-destructive">
        {error}
      </div>
    );
  }

  if (!contest) return <div className="min-h-screen" />;

  const status = contest.status;
  const label = STATUS_LABELS[status] ?? status;

  let targetMs = null;
  if (status === "SCHEDULED" && contest.startTime) {
    targetMs = new Date(contest.startTime).getTime();
  } else if (status === "LIVE" && contest.endTime) {
    targetMs = new Date(contest.endTime).getTime();
  }

  const showLeaderboard = status === "LIVE" || status === "ENDED";
  const isLeaderboardRoute = location.pathname.includes("leaderboard");

  return (
    <main className="min-h-screen px-6 py-10">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header */}
        <div className="border rounded-xl p-6">
          <h1 className="text-3xl font-bold">{contest.title}</h1>

          <div className="mt-4 flex gap-6 text-sm text-muted-foreground">
            <span>Start: {contest.startTime}</span>
            <span>End: {contest.endTime}</span>
            <span>Status: {label}</span>
          </div>

          {targetMs && (
            <div className="mt-4 font-mono text-primary">
              {status === "SCHEDULED" ? "Starts in: " : "Ends in: "}
              {formatRemaining(targetMs, now)}
            </div>
          )}

          {status === "ENDED" && (
            <div className="mt-4 font-mono text-primary">
              Contest Ended
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-6 border-b pb-2">
          <button
            onClick={() => navigate(`/contests/${contest.roomId}`)}
            className={`pb-2 ${
              !isLeaderboardRoute
                ? "border-b-2 border-primary font-semibold"
                : "text-muted-foreground"
            }`}
          >
            Problems
          </button>

          {showLeaderboard && (
            <button
              onClick={() =>
                navigate(`/contests/${contest.roomId}/leaderboard`)
              }
              className={`pb-2 ${
                isLeaderboardRoute
                  ? "border-b-2 border-primary font-semibold"
                  : "text-muted-foreground"
              }`}
            >
              Leaderboard
            </button>
          )}
        </div>

        <Outlet context={{ contest }} />

      </div>
    </main>
  );
}
