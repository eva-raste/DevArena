"use client"

import { ContestCard } from "./ContestCard"
import { useState, useMemo } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export function ContestsList({ contests, isLoading = false }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterTab, setFilterTab] = useState("all")

  /* ---------- derive status from time ---------- */
  const getContestStatus = (contest) => {
    if (!contest.startTime || !contest.endTime) return "ENDED"

    const now = new Date()
    const start = new Date(contest.startTime)
    const end = new Date(contest.endTime)

    if (now < start) return "UPCOMING"
    if (now >= start && now <= end) return "LIVE"
    return "ENDED"
  }

  /* ---------- filtering ---------- */
  const filteredContests = useMemo(() => {
    let filtered = contests

    if (filterTab !== "all") {
      filtered = filtered.filter(
        (contest) => getContestStatus(contest) === filterTab
      )
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.roomId.toLowerCase().includes(q)
      )
    }

    return filtered
  }, [contests, searchTerm, filterTab])

  /* ---------- loading ---------- */
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading contests...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">
            Coding Contests
          </h1>
          <p className="text-muted-foreground mt-2">
            Browse and join contests that match your skill level
          </p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search contests by title or room ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="
              pl-10 h-11
              bg-background
              border border-border
              text-foreground
              placeholder:text-muted-foreground
              focus:border-primary/60
              focus:ring-primary/20
            "
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={filterTab} onValueChange={setFilterTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-background border border-border">
          <TabsTrigger
            value="all"
            className="data-[state=active]:bg-primary/15 data-[state=active]:text-primary"
          >
            All ({contests.length})
          </TabsTrigger>

          <TabsTrigger
            value="UPCOMING"
            className="data-[state=active]:bg-primary/15 data-[state=active]:text-primary"
          >
            Upcoming
          </TabsTrigger>

          <TabsTrigger
            value="LIVE"
            className="data-[state=active]:bg-accent/20 data-[state=active]:text-accent"
          >
            Live
          </TabsTrigger>

          <TabsTrigger
            value="ENDED"
            className="data-[state=active]:bg-muted/40 data-[state=active]:text-muted-foreground"
          >
            Ended
          </TabsTrigger>
        </TabsList>

        {/* Content */}
        <div className="mt-6">
          {filteredContests.length === 0 ? (
            <div className="text-center py-12 bg-muted/30 rounded-lg border border-border">
              <p className="text-muted-foreground text-lg">
                {searchTerm
                  ? "No contests found matching your search"
                  : "No contests available"}
              </p>

              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="mt-4 text-primary hover:underline text-sm"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredContests.map((contest) => (
                <ContestCard
                  key={contest.contestId ?? contest.roomId}
                  contest={contest}
                />
              ))}
            </div>
          )}
        </div>
      </Tabs>
    </div>
  )
}
