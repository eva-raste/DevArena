import { useEffect, useState, useCallback } from "react"
import { fetchAllCOntestsApi, deleteContestApi } from "../../apis/contest-api"
import { useNavigate } from "react-router-dom"
import { useContestSocket } from "../../websocket/useContestSocket"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Trash2, Pencil } from "lucide-react"

/* ---------- helpers ---------- */

const STATUS_LABELS = {
  DRAFT: "DRAFT",
  SCHEDULED: "UPCOMING",
  LIVE: "RUNNING",
  ENDED: "ENDED",
}

const STATUS_BADGE_STYLES = {
  LIVE:
    "relative bg-emerald-500/15 text-emerald-500 border-emerald-500/30 font-bold uppercase tracking-wider animate-pulse ring-1 ring-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.4)]",

  SCHEDULED:
    "bg-blue-500/10 text-blue-500 border-blue-500/20 font-medium hover:bg-blue-500/20 transition-colors duration-500 ease-in-out",

  ENDED:
    "bg-slate-800/40 text-slate-100 border-slate-00/50 grayscale-[0.5] font-normal",

  DRAFT:
    "bg-zinc-500/5 text-zinc-500 border-zinc-500/20 border-dashed italic",
}

const formatRemaining = (targetMs, nowMs) => {
  let diff = Math.max(0, targetMs - nowMs)
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

export default function ContestsPage() {
  const navigate = useNavigate()

  const [contests, setContests] = useState([])
  const [error, setError] = useState(null)

  // delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedRoomId, setSelectedRoomId] = useState(null)

  // server-aligned clock (UI ONLY)
  const [serverOffset, setServerOffset] = useState(0)
  const [now, setNow] = useState(Date.now())

  /* ---------- initial REST fetch ---------- */
  useEffect(() => {
    const fetchContests = async () => {
      try {
        const data = await fetchAllCOntestsApi()
        setContests(data)
      } catch (err) {
        setError(err.message || "Failed to load contests")
      }
    }

    fetchContests()
  }, [])

  /* ---------- WebSocket handling ---------- */
  const handleSocketEvent = useCallback((event) => {
    if (event.serverTime) {
      setServerOffset(
        new Date(event.serverTime).getTime() - Date.now()
      )
    }

    setContests((prev) =>
      prev.map((c) =>
        c.contestId === event.contestId
          ? { ...c, status: event.status }
          : c
      )
    )
  }, [])

  useContestSocket({ onEvent: handleSocketEvent })

  /* ---------- ticking clock ---------- */
  useEffect(() => {
    const t = setInterval(() => {
      setNow(Date.now() + serverOffset)
    }, 1000)

    return () => clearInterval(t)
  }, [serverOffset])

  /* ---------- delete handlers ---------- */

  const onEdit = () => {
    // intentionally empty
  }

  const onDeleteClick = (roomId) => {
    setSelectedRoomId(roomId)
    setShowDeleteModal(true)
  }

  const onConfirmDelete = async () => {
    await deleteContestApi(selectedRoomId)
    setContests((prev) =>
      prev.filter((c) => c.roomId !== selectedRoomId)
    )
    setShowDeleteModal(false)
    setSelectedRoomId(null)
  }

  /* ---------- render ---------- */

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-destructive">
        {error}
      </div>
    )
  }

  if (!contests.length) {
    return <div className="min-h-screen bg-background" />
  }

  return (
    <main className="min-h-screen bg-background px-6 py-12 text-foreground">
      <div className="max-w-6xl mx-auto space-y-8">
        {contests.map((contest) => {
          const status = contest.status
          const label = STATUS_LABELS[status] ?? status

          let targetMs = null
          if (status === "SCHEDULED" && contest.startTime) {
            targetMs = new Date(contest.startTime).getTime()
          } else if (status === "LIVE" && contest.endTime) {
            targetMs = new Date(contest.endTime).getTime()
          }

          return (
            <div
              key={contest.roomId}
              className="border border-border rounded-xl p-6 bg-card space-y-4"
            >
              <div className="flex justify-between items-start">
                <h2 className="text-2xl font-bold">{contest.title}</h2>
                
                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded text-sm font-semibold ${
                      STATUS_BADGE_STYLES[status]
                    }`}
                  >
                    {label}
                  </span>

                  <button
                    onClick={onEdit}
                    className="p-2 rounded hover:bg-muted"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onDeleteClick(contest.roomId)}
                    className="p-2 rounded hover:bg-destructive/20 text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="text-s text-muted-foreground font-mono mt-1">
                    Room ID: <span className="text-foreground">{contest.roomId}</span>
                    </div>

              {targetMs && (
                <div className="font-mono text-primary">
                  {status === "SCHEDULED"
                    ? "Starts in: "
                    : "Ends in: "}
                  {formatRemaining(targetMs, now)}
                </div>
              )}

              <button
                onClick={() =>
                  navigate(`/contests/${contest.roomId}`)
                }
                disabled={status === "DRAFT"}
                className={`mt-2 px-4 py-2 rounded transition ${
                  status === "DRAFT"
                    ? "bg-muted text-muted-foreground cursor-not-allowed"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                }`}
              >
                View Contest
              </button>
            </div>
          )
        })}
      </div>

      {/* ---------- Delete Confirmation Modal ---------- */}
      <AlertDialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete contest?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the contest from all users.
              This action can be undone only by an admin.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={onConfirmDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  )
}
