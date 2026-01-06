import { useEffect, useState } from "react"
import { ContestsList } from "./show_own_contests/ContestList"
import { fetchAllCOntestsApi } from "../../apis/contest-api"
import { useNavigate } from "react-router-dom"

export default function ContestsPage() {
  const navigate = useNavigate()

  const [contests, setContests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchContests = async () => {
      try {
        setLoading(true)
        const data = await fetchAllCOntestsApi()
        setContests(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchContests()
  }, [])


  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617]">
        <p className="text-red-400 text-lg">{error}</p>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#020617] via-[#020617] to-[#020617] px-6 py-12">
      <div className="relative max-w-7xl mx-auto">

        <ContestsList contests={contests} isLoading={loading} />

        {!loading && (
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {contests.map((contest) => (
              <button
                key={contest.roomId}
                onClick={() => navigate(`/contests/${contest.roomId}`)}
                className="px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded"
              >
                View {contest.title}
              </button>
            ))}
          </div>
        )}

      </div>
    </main>
  )
}
