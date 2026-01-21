import { Skeleton } from "@/components/ui/skeleton"

export default function ContestSkeleton() {
  return (
    <div className="rounded-xl border bg-card p-4">
      <Skeleton className="h-6 w-2/3" />
      <Skeleton className="mt-2 h-4 w-1/2" />
      <Skeleton className="mt-4 h-9 w-28" />
    </div>
  )
}
