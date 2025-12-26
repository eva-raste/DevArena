"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Lock, Globe, Code2 } from "lucide-react"
import { formatDistanceToNow, formatDate } from "@/lib/date-utils"

export function ContestCard({ contest }) {
  const statusConfig = {
    DRAFT: {
      label: "DRAFT",
      className: "bg-slate-500/15 text-slate-300 border border-slate-500/30",
    },
    SCHEDULED: {
      label: "SCHEDULED",
      className: "bg-indigo-500/15 text-indigo-300 border border-indigo-500/30",
    },
    LIVE: {
      label: "LIVE",
      className:
        "bg-pink-500/20 text-pink-300 border border-pink-500/40 animate-pulse",
    },
    ENDED: {
      label: "ENDED",
      className: "bg-slate-700/30 text-slate-400 border border-slate-600/40",
    },
  }

  const visibilityConfig = {
    PUBLIC: {
      icon: Globe,
      label: "Public",
    },
    PRIVATE: {
      icon: Lock,
      label: "Private",
    },
  }

  const status = statusConfig[contest.status]
  const visibility = visibilityConfig[contest.visibility]
  const VisibilityIcon = visibility.icon

  const startDate = contest.startTime ? new Date(contest.startTime) : null
  const endDate = contest.endTime ? new Date(contest.endTime) : null

  return (
    <Card
      className="
        h-full
        bg-[#020617]/70
        border border-white/10
        hover:border-indigo-400/40
        hover:shadow-[0_0_0_1px_rgba(99,102,241,0.25)]
        transition-all
        cursor-pointer
      "
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="text-lg font-medium text-slate-100 line-clamp-2">
              {contest.title}
            </CardTitle>

            <CardDescription className="text-xs text-slate-500 mt-1">
              Room ID: {contest.roomId}
            </CardDescription>
          </div>

          {status && (
            <Badge variant="outline" className={status.className}>
              {status.label}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Visibility */}
        <div className="flex items-center gap-2">
          <VisibilityIcon className="w-4 h-4 text-slate-400" />
          <span className="text-sm text-slate-400">
            {visibility.label}
          </span>
        </div>

        {/* Dates (render only if present) */}
        {(startDate || endDate) && (
          <div className="space-y-3 border-t border-white/10 pt-3">
            {startDate && (
              <div className="flex items-start gap-2">
                <Calendar className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div className="flex-1 text-sm">
                  <div className="text-slate-200 font-medium">
                    Starts: {formatDate(startDate)}
                  </div>
                  <div className="text-xs text-slate-500">
                    {formatDistanceToNow(startDate)} from now
                  </div>
                </div>
              </div>
            )}

            {endDate && (
              <div className="flex items-start gap-2">
                <Calendar className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div className="flex-1 text-sm">
                  <div className="text-slate-200 font-medium">
                    Ends: {formatDate(endDate)}
                  </div>
                  <div className="text-xs text-slate-500">
                    {formatDistanceToNow(endDate)} from now
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer hint */}
        <div className="flex items-center gap-2 pt-3 border-t border-white/10">
          <Code2 className="w-4 h-4 text-indigo-400" />
          <span className="text-xs text-slate-500">
            Click to view details
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
