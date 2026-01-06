import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { fetchContestByIdApi } from "../../apis/contest-api"

export default function ContestDetailsPage() {
  const { contestId } = useParams()
  const navigate = useNavigate()

  const [contest, setContest] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchContest = async () => {
      try {
        setLoading(true)
        const data = await fetchContestByIdApi(contestId)
        setContest(data)
      } catch (err) {
        setError(err.message || "Failed to load contest")
      } finally {
        setLoading(false)
      }
    }

    if (contestId) fetchContest()
  }, [contestId])

  const handleCardClick = (slug) => {
    navigate(`/question/${slug}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617] text-white">
        Loading contest...
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617] text-red-400">
        {error}
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-[#020617] px-6 py-10 text-white">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Contest Header */}
        <div className="border border-white/10 rounded-lg p-6 bg-white/5">
          <h1 className="text-3xl font-bold">{contest.title}</h1>

          <div className="flex gap-6 mt-4 text-sm text-white/60">
            <span>Start: {contest.startTime}</span>
            <span>End: {contest.endTime}</span>
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Questions</h2>

          {contest.questions?.length === 0 && (
            <p className="text-white/60">No questions added yet.</p>
          )}

          {contest.questions?.map((q, index) => (
            <div
              key={q.questionSlug}
              onClick={() => handleCardClick(q.questionSlug)}
              className="border border-white/10 rounded-md p-4 bg-white/5 hover:bg-white/10 transition cursor-pointer"
            >
              <div className="flex justify-between items-center">
                <h3 className="font-medium">
                  {index + 1}. {q.title}
                </h3>

                <span className="text-xs px-2 py-1 rounded bg-indigo-500/20 text-indigo-300">
                  {q.difficulty}
                </span>
              </div>

              <p className="text-sm text-white/60 mt-2">
                Score: {q.score}
              </p>
            </div>
          ))}
        </div>

      </div>
    </main>
  )
}
