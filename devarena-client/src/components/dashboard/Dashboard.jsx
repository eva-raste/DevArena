import { useRef, useEffect, useState , useCallback} from "react"
import { fetchPublicContests , fetchContestByIdApi } from "@/apis/contest-api"
import { useContestSocket } from "../../websocket/useContestSocket"
import StatusTabs from "./StatusTabs"
import ContestCard from "./ContestCard"
import ContestSkeleton from "./ContestSkeleton"
import PaginationControls from "./PaginationControls"
import EmptyState from "./EmptyState"
import ErrorState from "./ErrorState"

export default function Dashboard() {
  const [status, setStatus] = useState(null)
  const [page, setPage] = useState(0)
  const [now, setNow] = useState(Date.now())

  const [contests, setContests] = useState([])
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [serverOffset, setServerOffset] = useState(0)

  const contestCacheRef = useRef(new Map());

  const loadContests = () => {
    setLoading(true)
    setError(false)

    fetchPublicContests({ page, size: 10, status })
      .then(data => {
        console.log(data);

        setContests(data.content);
        setTotalPages(data.totalPages);

        // CACHE POPULATION (ADDED)
        data.content.forEach(c =>
          contestCacheRef.current.set(c.roomId, c)
        );

      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadContests()
  }, [page, status])

  /* ---------- websocket ---------- */

 const handleSocketEvent = useCallback((event) => {
   console.log("⚡ SOCKET EVENT RECEIVED", event);

   if (!event?.roomId || !event?.status) return;

   setContests((prev) => {
     const cached = contestCacheRef.current.get(event.roomId);
     const exists = prev.find(c => c.roomId === event.roomId);

     // Contest already visible → update
     if (exists) {
       const updated = prev.map(c =>
         c.roomId === event.roomId
           ? { ...c, status: event.status }
           : c
       );

       // Apply Dashboard filter
       if (status !== null) {
         return updated.filter(c => c.status === status);
       }

       return updated;
     }

     // Contest entering current tab
     if (status === null || status === event.status) {

       //  Cache hit
       if (cached) {
         return [{ ...cached, status: event.status }, ...prev];
       }

       //  Cache miss → placeholder + fetch
       const placeholder = {
         roomId: event.roomId,
         status: event.status,
         _loading: true,
       };

       fetchContestByIdApi(event.roomId)
         .then(full => {
           contestCacheRef.current.set(full.roomId, full);

           setContests(curr =>
             curr.map(c =>
               c.roomId === full.roomId ? full : c
             )
           );
         })
         .catch(() => {});

       return [placeholder, ...prev];
     }

     return prev;
   });
 }, [status]);


  useContestSocket({ onEvent: handleSocketEvent })

  useEffect(() => {
    const t = setInterval(() => {
      setNow(Date.now() + serverOffset)
    }, 1000)
    return () => clearInterval(t)
  }, [serverOffset])


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
          <ContestCard
            key={c.roomId}
            contest={c}
          />
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
