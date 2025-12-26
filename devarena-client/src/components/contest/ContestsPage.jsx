"use client"

import { useEffect, useState } from "react"
import { ContestsList } from "./show_own_contests/ContestList"
import { fetchAllCOntestsApi } from '../../apis/contest-api'

export default function ContestsPage() {
  const [contests, setContests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchContests = async () => {
      try {
        setLoading(true)
        const res = await fetchAllCOntestsApi();

        const data = res;
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
    <main className="min-h-screen bg-gradient-to-br from-[#020617] via-[#020617] to-[#020617] relative overflow-hidden px-6 py-12">
      {/* subtle glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-pink-500/10 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto">
        <ContestsList contests={contests} isLoading={loading} />
      </div>
    </main>


  )
}
