import { useEffect, useState, useCallback } from "react";
import { fetchAllCOntestsApi } from "../../apis/contest-api";
import { useNavigate } from "react-router-dom";
import { useContestSocket } from "../../websocket/useContestSocket";

/* ---------- helpers ---------- */

const STATUS_LABELS = {
  DRAFT: "DRAFT",
  SCHEDULED: "UPCOMING",
  LIVE: "RUNNING",
  ENDED: "ENDED",
};

const STATUS_BADGE_STYLES = {
  LIVE:
    "relative bg-emerald-500/15 text-emerald-500 border-emerald-500/30 font-bold uppercase tracking-wider animate-pulse ring-1 ring-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.4)]",

  SCHEDULED:
    "bg-blue-500/10 text-blue-500 border-blue-500/20 font-medium hover:bg-blue-500/20 transition-colors duration-500 ease-in-out",

  ENDED:
    "bg-slate-800/40 text-slate-100 border-slate-00/50 grayscale-[0.5] font-normal",

  DRAFT:
    "bg-zinc-500/5 text-zinc-500 border-zinc-500/20 border-dashed italic",
};

const formatRemaining = (targetMs, nowMs) => {
  let diff = Math.max(0, targetMs - nowMs);
  if (diff === 0) return "00s";

  const units = [
    { label: "y", ms: 1000 * 60 * 60 * 24 * 365 },
    { label: "mo", ms: 1000 * 60 * 60 * 24 * 30 },
    { label: "d", ms: 1000 * 60 * 60 * 24 },
    { label: "h", ms: 1000 * 60 * 60 },
    { label: "m", ms: 1000 * 60 },
    { label: "s", ms: 1000 },
  ];

  const parts = [];
  for (const u of units) {
    const v = Math.floor(diff / u.ms);
    if (v > 0) {
      parts.push(`${v}${u.label}`);
      diff %= u.ms;
    }
  }

  return parts.join(" ");
};

/* ---------- component ---------- */

export default function ContestsPage() {
  const navigate = useNavigate();

  const [contests, setContests] = useState([]);
  const [error, setError] = useState(null);

  // server-aligned clock (UI ONLY)
  const [serverOffset, setServerOffset] = useState(0);
  const [now, setNow] = useState(Date.now());

  /* ---------- initial REST fetch ---------- */
  useEffect(() => {
    const fetchContests = async () => {
      try {
        const data = await fetchAllCOntestsApi();
        setContests(data);
      } catch (err) {
        setError(err.message || "Failed to load contests");
      }
    };

    fetchContests();
  }, []);

  /* ---------- WebSocket handling (via custom hook) ---------- */
  const handleSocketEvent = useCallback((event) => {
    // align UI clock
    if (event.serverTime) {
      setServerOffset(
        new Date(event.serverTime).getTime() - Date.now()
      );
    }

    // update contest status if it exists
    setContests((prev) => {
      const exists = prev.some(
        (c) => c.contestId === event.contestId
      );
      if (!exists) return prev;

      return prev.map((c) =>
        c.contestId === event.contestId
          ? { ...c, status: event.status }
          : c
      );
    });
  }, []);

  useContestSocket({ onEvent: handleSocketEvent });

  /* ---------- ticking clock (UI ONLY) ---------- */
  useEffect(() => {
    const t = setInterval(() => {
      setNow(Date.now() + serverOffset);
    }, 1000);

    return () => clearInterval(t);
  }, [serverOffset]);

  /* ---------- render ---------- */

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-destructive">
        {error}
      </div>
    );
  }

  if (!contests.length) {
    return <div className="min-h-screen bg-background" />;
  }

  return (
    <main className="min-h-screen bg-background px-6 py-12 text-foreground">
      <div className="max-w-6xl mx-auto space-y-8">
        {contests.map((contest) => {
          const status = contest.status;
          const label = STATUS_LABELS[status] ?? status;

          let targetMs = null;
          if (status === "SCHEDULED" && contest.startTime) {
            targetMs = new Date(contest.startTime).getTime();
          } else if (status === "LIVE" && contest.endTime) {
            targetMs = new Date(contest.endTime).getTime();
          }

          return (
            <div
              key={contest.roomId}
              className="border border-border rounded-xl p-6 bg-card space-y-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold">{contest.title}</h2>

                  {contest.startTime && (
                    <p className="text-sm text-muted-foreground">
                      Start: {contest.startTime}
                    </p>
                  )}

                  {contest.endTime && (
                    <p className="text-sm text-muted-foreground">
                      End: {contest.endTime}
                    </p>
                  )}
                </div>

                <span
                  className={`px-3 py-1 rounded text-sm font-semibold ${
                    STATUS_BADGE_STYLES[status]
                  }`}
                >
                  {label}
                </span>
              </div>

              {targetMs && (
                <div className="font-mono text-primary">
                  {status === "SCHEDULED"
                    ? "Starts in: "
                    : "Ends in: "}
                  {formatRemaining(targetMs, now)}
                </div>
              )}

              {status === "ENDED" && (
                <div className="font-mono text-primary">
                  Ends in: 00s
                </div>
              )}

              {contest.instructions && (
                <div className="bg-muted/30 rounded-lg p-4">
                  <h3 className="font-semibold mb-1">Instructions</h3>
                  <p className="whitespace-pre-line text-muted-foreground">
                    {contest.instructions}
                  </p>
                </div>
              )}

              <button
                onClick={() =>
                  navigate(`/contests/${contest.roomId}`)
                }
                disabled={status === "DRAFT"}
                className={`mt-2 px-4 py-2 rounded transition ${
                  status === "DRAFT"
                    ? "bg-muted text-muted-foreground cursor-not-allowed"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                }`}
              >
                View Contest
              </button>
            </div>
          );
        })}
      </div>
    </main>
  );
}
