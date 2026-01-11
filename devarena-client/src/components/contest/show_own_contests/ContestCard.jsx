"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Lock, Globe, Code2 } from "lucide-react"
import { formatDistanceToNow, formatDate } from "@/lib/date-utils"

export function ContestCard({ contest }) {
  const statusConfig = {
    DRAFT: {
      label: "DRAFT",
      className: "bg-muted text-muted-foreground border border-border",
    },
    SCHEDULED: {
      label: "SCHEDULED",
      className: "bg-primary/15 text-primary border border-primary/30",
    },
    LIVE: {
      label: "LIVE",
      className:
        "bg-accent/20 text-accent border border-accent/40 animate-pulse",
    },
    ENDED: {
      label: "ENDED",
      className: "bg-muted/40 text-muted-foreground border border-border",
    },
  }

  const visibilityConfig = {
    PUBLIC: { icon: Globe, label: "Public" },
    PRIVATE: { icon: Lock, label: "Private" },
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
        bg-card
        border border-border
        hover:border-primary/40
        hover:shadow-[0_0_0_1px_hsl(var(--primary)/0.25)]
        transition-all
        cursor-pointer
      "
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="text-lg font-medium text-foreground line-clamp-2">
              {contest.title}
            </CardTitle>

            <CardDescription className="text-xs text-muted-foreground mt-1">
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
          <VisibilityIcon className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {visibility.label}
          </span>
        </div>

        {/* Dates */}
        {(startDate || endDate) && (
          <div className="space-y-3 border-t border-border pt-3">
            {startDate && (
              <div className="flex items-start gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                <div className="flex-1 text-sm">
                  <div className="text-foreground font-medium">
                    Starts: {formatDate(startDate)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatDistanceToNow(startDate)} from now
                  </div>
                </div>
              </div>
            )}

            {endDate && (
              <div className="flex items-start gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                <div className="flex-1 text-sm">
                  <div className="text-foreground font-medium">
                    Ends: {formatDate(endDate)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatDistanceToNow(endDate)} from now
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer hint */}
        <div className="flex items-center gap-2 pt-3 border-t border-border">
          <Code2 className="w-4 h-4 text-primary" />
          <span className="text-xs text-muted-foreground">
            Click to view details
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
