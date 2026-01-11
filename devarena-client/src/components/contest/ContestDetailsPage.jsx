import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { fetchContestByIdApi } from "../../apis/contest-api"
import getDifficultyColor from "../helpers/colorDifficulty"

/* ---------- helpers ---------- */

const getContestStatus = (start, end) => {
  const now = new Date()
  if (now < new Date(start)) return "UPCOMING"
  if (now > new Date(end)) return "ENDED"
  return "RUNNING"
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

/* ---------- component ---------- */

export default function ContestDetailsPage() {
  const { contestId } = useParams()
  const navigate = useNavigate()

  const [contest, setContest] = useState(null)
  const [error, setError] = useState(null)
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    fetchContestByIdApi(contestId)
      .then(setContest)
      .catch((e) => setError(e.message || "Failed to load contest"))
  }, [contestId])

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

  if (!contest) {
    return <div className="min-h-screen bg-background" />
  }

  const status = getContestStatus(contest.startTime, contest.endTime)
  const target =
    status === "UPCOMING"
      ? new Date(contest.startTime)
      : new Date(contest.endTime)

  return (
    <main className="min-h-screen bg-background px-6 py-10 text-foreground">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header */}
        <div className="border border-border rounded-lg p-6 bg-card">
          <h1 className="text-3xl font-bold">{contest.title}</h1>

          <div className="flex gap-6 mt-4 text-sm text-muted-foreground">
            <span>Start: {contest.startTime}</span>
            <span>End: {contest.endTime}</span>
          </div>

          {status !== "ENDED" && (
            <div className="mt-4 font-mono text-primary">
              {status === "UPCOMING" ? "Starts in: " : "Ends in: "}
              {formatRemaining(target, now)}
            </div>
          )}
        </div>

        {/* Instructions */}
        {contest.instructions && (
          <div className="bg-muted/30 rounded-lg p-4">
            <h3 className="font-semibold mb-1">Instructions</h3>
            <p className="whitespace-pre-line text-muted-foreground">
              {contest.instructions}
            </p>
          </div>
        )}

        {/* Questions */}
        {(status === "RUNNING" || status === "ENDED") && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Questions</h2>

            {contest.questions?.map((q, index) => (
              <div
                key={q.questionSlug}
                onClick={() => navigate(`/question/${q.questionSlug}`)}
                className="border border-border rounded-md p-4 bg-card hover:bg-accent transition cursor-pointer"
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">
                    {index + 1}. {q.title}
                  </h3>

                  <span className={`px-3 py-1 rounded-full text-xs font-bold  ${getDifficultyColor(q.difficulty)}`}>
                    {q.difficulty}
                  </span>
                </div>

                <p className="text-sm text-muted-foreground mt-2">
                  Score: {q.score}
                </p>
              </div>
            ))}
          </div>
        )}

        {status === "UPCOMING" && (
          <div className="text-warning font-semibold">
            Contest has not started yet
          </div>
        )}
      </div>
    </main>
  )
}
