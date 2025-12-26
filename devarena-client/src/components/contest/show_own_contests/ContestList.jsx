"use client"

import { ContestCard } from "./ContestCard"
import { useState, useMemo } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export function ContestsList({ contests, isLoading = false }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterTab, setFilterTab] = useState("all")

  const filteredContests = useMemo(() => {
    let filtered = contests

    if (filterTab !== "all") {
      filtered = filtered.filter((c) => c.status === filterTab)
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (c) =>
          c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.roomId.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    return filtered
  }, [contests, searchTerm, filterTab])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground dark:text-muted-foreground">Loading contests...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full space-y-6">
      {/* Header Section */}
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-semibold text-white">
            Coding Contests
          </h1>
          <p className="text-slate-400 mt-2">
            Browse and join contests that match your skill level
          </p>

        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground dark:text-muted-foreground" />
          <Input
            placeholder="Search contests by title or room ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="
              pl-10 h-11
              bg-[#020617]/60
              border border-white/10
              text-slate-200
              placeholder:text-slate-500
              focus:border-indigo-400/60
              focus:ring-indigo-400/20
            "
          />

        </div>
      </div>

      {/* Filter Tabs */}
      <Tabs value={filterTab} onValueChange={setFilterTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-[#020617]/60 border border-white/10">
          <TabsTrigger
            value="all"
            className="data-[state=active]:bg-indigo-500/15 data-[state=active]:text-indigo-300"
          >
            All ({contests.length})
          </TabsTrigger>

          <TabsTrigger
            value="UPCOMING"
            className="data-[state=active]:bg-indigo-500/15 data-[state=active]:text-indigo-300"
          >
            Upcoming
          </TabsTrigger>

          <TabsTrigger
            value="LIVE"
            className="data-[state=active]:bg-pink-500/15 data-[state=active]:text-pink-300"
          >
            Live
          </TabsTrigger>

          <TabsTrigger
            value="ENDED"
            className="data-[state=active]:bg-slate-500/15 data-[state=active]:text-slate-300"
          >
            Ended
          </TabsTrigger>
        </TabsList>


        {/* Content - Grid of Contest Cards */}
        <div className="mt-6">
          {filteredContests.length === 0 ? (
            <div className="text-center py-12 bg-muted/30 dark:bg-muted/30 rounded-lg border border-border">
              <p className="text-muted-foreground dark:text-muted-foreground text-lg">
                {searchTerm ? "No contests found matching your search" : "No contests available"}
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="mt-4 text-primary dark:text-primary hover:underline text-sm"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredContests.map((contest) => (
                <ContestCard key={contest.contestId} contest={contest} />
              ))}
            </div>
          )}
        </div>
      </Tabs>
    </div>
  )
}
