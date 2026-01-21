import { useEffect, useState } from "react"
import { fetchPublicContests } from "@/apis/contest-api"

import StatusTabs from "./StatusTabs"
import ContestCard from "./ContestCard"
import ContestSkeleton from "./ContestSkeleton"
import PaginationControls from "./PaginationControls"
import EmptyState from "./EmptyState"
import ErrorState from "./ErrorState"

export default function Dashboard() {
  const [status, setStatus] = useState(null)
  const [page, setPage] = useState(0)
  const [contests, setContests] = useState([])
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  const loadContests = () => {
    setLoading(true)
    setError(false)

    fetchPublicContests({ page, size: 10, status })
      .then(data => {
        setContests(data.content)
        setTotalPages(data.totalPages)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadContests()
  }, [page, status])

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <StatusTabs
        status={status}
        onChange={(val) => {
          setStatus(val === "ALL" ? null : val)
          setPage(0)
        }}
      />

      <div className="grid gap-4">
        {loading && Array.from({ length: 5 }).map((_, i) => (
          <ContestSkeleton key={i} />
        ))}

        {!loading && error && <ErrorState onRetry={loadContests} />}

        {!loading && !error && contests.length === 0 && (
          <EmptyState onReset={() => {
            setStatus(null)
            setPage(0)
          }} />
        )}

        {!loading && !error && contests.map(c => (
          <ContestCard key={c.slug} contest={c} />
        ))}
      </div>

      <PaginationControls
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  )
}
