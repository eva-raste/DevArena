import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"

const STATUS_STYLES = {
  LIVE: "bg-green-500/10 text-green-600 dark:text-green-400",
  SCHEDULED: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  ENDED: "bg-gray-500/10 text-gray-600 dark:text-gray-400",
}

export default function ContestCard({ contest }) {
  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm transition hover:shadow-md">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{contest.title}</h3>
        <Badge className={STATUS_STYLES[contest.status]}>
          {contest.status}
        </Badge>
      </div>

      <div className="mt-2 text-sm text-muted-foreground">
        {contest.startTime} → {contest.endTime}
      </div>

      <div className="mt-4">
        {contest.status === "LIVE" && (
            <Link to={`/contests/${contest.roomId}`}>
                <Button>Join Contest</Button>
            </Link>
        )}

        {contest.status === "SCHEDULED" && (
            <Link to={`/contests/${contest.roomId}`}>
                <Button variant="outline">View Details</Button>
            </Link>
        )}

        {contest.status === "ENDED" && (
          <Button variant="secondary">View Results</Button>
        )}
      </div>
    </div>
  )
}
