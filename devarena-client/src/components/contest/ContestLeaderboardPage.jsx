import {
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { useOutletContext } from "react-router-dom";
import {
  fetchContestLeaderboard,
  fetchMyLeaderboardRow,
} from "../../apis/contest-api";

/**
 * < 1 hour  →  "43:07"            (MM:SS)
 * < 1 day   →  "3h 43m 07s"       (Hh Mm Ss)
 * ≥ 1 day   →  "2d 3h 43m 07s"     (Dd Hh Mm Ss)
 */
function formatSeconds(totalSeconds) {
  if (totalSeconds == null || totalSeconds < 0) return "—";

  const s = totalSeconds % 60;
  const m = Math.floor(totalSeconds / 60) % 60;
  const h = Math.floor(totalSeconds / 3600) % 24;
  const d = Math.floor(totalSeconds / 86400);

  const pad = (n) => String(n).padStart(2, "0");

  if (d > 0) {
    // 2d 3h 43m 07s
    return `${d}d ${h}h ${pad(m)}m ${pad(s)}s`;
  }

  if (h > 0) {
    // 3h 43m 07s
    return `${h}h ${pad(m)}m ${pad(s)}s`;
  }

  // 43:07
  return `${pad(m)}:${pad(s)}`;
}

export default function ContestLeaderboardPage() {
  const { contest } = useOutletContext();

  const [data, setData] = useState(null);
  const [myRow, setMyRow] = useState(null);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);

  const size = 50;

  const loadLeaderboard = useCallback(async () => {
    if (!contest?.roomId) return;

    try {
      setLoading(true);

      const [pageData, myData] = await Promise.all([
        fetchContestLeaderboard(contest.roomId, page, size),
        fetchMyLeaderboardRow(contest.roomId),
      ]);
      console.log(pageData);
      console.log(myData);
      setData(pageData);
      setMyRow(myData);
    } catch (e) {
      console.error("Leaderboard fetch failed", e);
    } finally {
      setLoading(false);
    }
  }, [contest, page]);

  useEffect(() => {
    loadLeaderboard();
  }, [loadLeaderboard]);

  useEffect(() => {
    const interval = setInterval(() => {
      loadLeaderboard();
    }, 120000);

    return () => clearInterval(interval);
  }, [loadLeaderboard]);

  const otherRows = useMemo(() => {
    if (!data?.content) return [];

    if (!myRow) return data.content;

    return data.content.filter(
      (r) => r.username !== myRow.username
    );
  }, [data, myRow]);

  if (loading && !data) {
    return <div>Loading leaderboard...</div>;
  }

  if (!data) return null;

  
return (
  <div className="space-y-3">
    <div className="overflow-x-auto rounded-xl border border-border shadow-sm">
      <table className="min-w-full text-sm border-collapse">

        {/* ── Header ── */}
        <thead>
          <tr className="border-b border-border bg-muted/60 backdrop-blur-sm">
            <th className="px-4 py-3 text-left font-medium text-muted-foreground sticky left-0 bg-muted/60 z-30 w-[72px]">
              #
            </th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground sticky left-[72px] bg-muted/60 z-30 min-w-[160px]">
              User
            </th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground min-w-[90px]">
              Score
            </th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground min-w-[80px]">
              Solved
            </th>
            {data.questionsMeta.map((q) => (
              <th
                key={q.questionSlug}
                className="px-4 py-3 text-center font-medium text-muted-foreground whitespace-nowrap"
              >
                <span className="block">{q.title}</span>
                <span className="block text-xs font-normal text-muted-foreground/70 mt-0.5">
                  {q.score} pts
                </span>
              </th>
            ))}
          </tr>
        </thead>

        <tbody>

          {/* ── My Row ── */}
          {myRow && (
            <tr
              className="
                border-b border-primary/20 bg-primary/10
                font-semibold
                row-animate
                transition-colors duration-150
                hover:bg-primary/15
              "
              style={{ animationDelay: "0ms" }}
            >
              <td className="px-4 py-3 sticky left-0 bg-primary/10 z-10">
                <RankBadge rank={myRow.rank} />
              </td>
              <td className="px-4 py-3 sticky left-[72px] bg-primary/10 z-10">
                <div className="flex items-center gap-2">
                  <span>{myRow.username}</span>
                  <span className="text-[10px] font-bold tracking-widest uppercase px-1.5 py-0.5 rounded bg-primary/20 text-primary">
                    You
                  </span>
                </div>
              </td>
              <td className="px-4 py-3">
                <span className="font-bold text-primary tabular-nums">
                  {myRow.totalScore}
                </span>
              </td>
              <td className="px-4 py-3 tabular-nums">
                {myRow.solvedCount}
              </td>
              {data.questionsMeta.map((q) => {
                const attempt = myRow.questions.find(
                  (x) => x.questionSlug === q.questionSlug
                );
                return (
                  <td key={q.questionSlug} className="px-4 py-3 text-center tabular-nums">
                    {attempt ? (
                      <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400 font-medium">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="2">
                          <path d="M2 6l3 3 5-5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        {formatSeconds(attempt.acceptedSeconds)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground/40">—</span>
                    )}
                  </td>
                );
              })}
            </tr>
          )}

          {/* ── Other Rows ── */}
          {otherRows.map((row, i) => (
            <tr
              key={row.username}
              className="
                border-b border-border/60 last:border-0
                row-animate
                transition-colors duration-100
                hover:bg-accent/50
                group
              "
              style={{ animationDelay: `${(i + 1) * 30}ms` }}
            >
              <td className="px-4 py-3 sticky left-0 bg-background z-10 group-hover:bg-accent/50 transition-colors duration-100">
                <RankBadge rank={row.rank} />
              </td>
              <td className="px-4 py-3 sticky left-[72px] bg-background z-10 group-hover:bg-accent/50 transition-colors duration-100 font-medium">
                {row.username}
              </td>
              <td className="px-4 py-3">
                <span className="font-semibold tabular-nums">{row.totalScore}</span>
              </td>
              <td className="px-4 py-3 text-muted-foreground tabular-nums">
                {row.solvedCount}
              </td>
              {data.questionsMeta.map((q) => {
                const attempt = row.questions.find(
                  (x) => x.questionSlug === q.questionSlug
                );
                return (
                  <td key={q.questionSlug} className="px-4 py-3 text-center tabular-nums">
                    {attempt ? (
                      <span className="text-green-600 dark:text-green-400 font-medium text-xs">
                        {formatSeconds(attempt.acceptedSeconds)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground/40">—</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* ── Pagination ── */}
    <div className="flex justify-between items-center text-sm px-1">
      <span className="text-muted-foreground">
        Page{" "}
        <span className="font-semibold text-foreground">{data.page + 1}</span>
        {" "}of{" "}
        <span className="font-semibold text-foreground">{data.totalPages}</span>
      </span>

      <div className="flex gap-2">
        <button
          disabled={page === 0}
          onClick={() => setPage((p) => p - 1)}
          className="
            px-3 py-1.5 border border-border rounded-lg text-sm font-medium
            disabled:opacity-40 disabled:cursor-not-allowed
            hover:bg-accent hover:border-accent-foreground/20
            active:scale-95
            transition-all duration-100
          "
        >
          ← Prev
        </button>
        <button
          disabled={page >= data.totalPages - 1}
          onClick={() => setPage((p) => p + 1)}
          className="
            px-3 py-1.5 border border-border rounded-lg text-sm font-medium
            disabled:opacity-40 disabled:cursor-not-allowed
            hover:bg-accent hover:border-accent-foreground/20
            active:scale-95
            transition-all duration-100
          "
        >
          Next →
        </button>
      </div>
    </div>
  </div>
);

}


// ── Helper component ──────────────────────────────────────────────────────────
// Place this outside your main component (in the same file or a separate one)

function RankBadge({ rank }) {
  if (rank === 1) {
    return (
      <span
        className="badge-pulse inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold bg-yellow-400/20 text-yellow-500 border border-yellow-400/40"
        style={{ "--badge-glow": "234,179,8" }}
      >
        🥇
      </span>
    );
  }
  if (rank === 2) {
    return (
      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold bg-slate-300/20 text-slate-400 border border-slate-400/30">
        🥈
      </span>
    );
  }
  if (rank === 3) {
    return (
      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold bg-orange-400/20 text-orange-500 border border-orange-400/30">
        🥉
      </span>
    );
  }
  return (
    <span className="text-muted-foreground font-mono tabular-nums">
      {rank}
    </span>
  );
}