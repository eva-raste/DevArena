import { useEffect, useState } from "react"
import { fetchAllCOntestsApi } from "../../apis/contest-api"
import { useNavigate } from "react-router-dom"
import { Badge, CaseLower } from "lucide-react"

/* ---------- helpers ---------- */

const STATUS_LABELS = {
  DRAFT: "DRAFT",
  SCHEDULED: "UPCOMING",
  LIVE: "RUNNING",
  ENDED: "ENDED",
}

const STATUS_BADGE_STYLES = {
  // Pulse + ring expansion for high urgency
  LIVE: 
    "relative bg-emerald-500/15 text-emerald-500 border-emerald-500/30 font-bold uppercase tracking-wider animate-pulse ring-1 ring-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.4)]",

  // Smooth breathing animation for something waiting to happen
  SCHEDULED: 
    "bg-blue-500/10 text-blue-500 border-blue-500/20 font-medium hover:bg-blue-500/20 transition-colors duration-500 ease-in-out",

  // Static, low-contrast for completed tasks
  ENDED: 
    "bg-slate-800/40 text-slate-100 border-slate-00/50 grayscale-[0.5] font-normal",

  // Subtle dash and "ghost" appearance for work-in-progress
  DRAFT: 
    "bg-zinc-500/5 text-zinc-500 border-zinc-500/20 border-dashed italic",
}




const formatRemaining = (target, now) => {
  let diff = Math.max(0, target - now)
  if (diff === 0) return "00s"

  const units = [
    { label: "y", ms: 1000 * 60 * 60 * 24 * 365 },
    { label: "mo", ms: 1000 * 60 * 60 * 24 * 30 },
    { label: "d", ms: 1000 * 60 * 60 * 24 },
    { label: "h", ms: 1000 * 60 * 60 },
    { label: "m", ms: 1000 * 60 },
    { label: "s", ms: 1000 },
  ]

  const parts = []
  for (const u of units) {
    const v = Math.floor(diff / u.ms)
    if (v > 0) {
      parts.push(`${v}${u.label}`)
      diff %= u.ms
    }
  }

  return parts.join(" ")
}

const getCountdownTarget = (contest) => {
  if (contest.status === "SCHEDULED" && contest.startTime) {
    return new Date(contest.startTime)
  }
  if (contest.status === "LIVE" && contest.endTime) {
    return new Date(contest.endTime)
  }
  return null
}

/* ---------- component ---------- */

export default function ContestsPage() {
  const navigate = useNavigate()
  const [contests, setContests] = useState([])
  const [error, setError] = useState(null)
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const fetchContests = async () => {
      try {
        const data = await fetchAllCOntestsApi()
        setContests(data)
      } catch (err) {
        setError(err.message || "Failed to load contests")
      }
    }

    fetchContests()
  }, [])

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-destructive">
        {error}
      </div>
    )
  }

  if (!contests.length) {
    return <div className="min-h-screen bg-background" />
  }

  return (
    <main className="min-h-screen bg-background px-6 py-12 text-foreground">
      <div className="max-w-6xl mx-auto space-y-8">
        {contests.map((contest) => {
          const uiStatus = STATUS_LABELS[contest.status] ?? contest.status
          const target = getCountdownTarget(contest)

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

                {/* Status badge */}
                <span
                  className={`px-3 py-1 rounded text-sm font-semibold ${
                    STATUS_BADGE_STYLES[contest.status] ??
                    "bg-muted text-muted-foreground border border-border"
                  }`}
                >
                  {uiStatus}
                </span>

              </div>

              {/* Countdown */}
              {target && (
                <div className="font-mono text-primary">
                  {contest.status === "SCHEDULED" ? "Starts in: " : "Ends in: "}
                  {formatRemaining(target, now)}
                </div>
              )}

              {/* Instructions */}
              {contest.instructions && (
                <div className="bg-muted/30 rounded-lg p-4">
                  <h3 className="font-semibold mb-1">Instructions</h3>
                  <p className="whitespace-pre-line text-muted-foreground">
                    {contest.instructions}
                  </p>
                </div>
              )}

              {/* Action button */}
              <button
                onClick={() => navigate(`/contests/${contest.roomId}`)}
                disabled={contest.status === "DRAFT"}
                className={`mt-2 px-4 py-2 rounded transition ${
                  contest.status === "DRAFT"
                    ? "bg-muted text-muted-foreground cursor-not-allowed"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                }`}
              >
                View Contest
              </button>
            </div>
          )
        })}
      </div>
    </main>
  )
}
