import { Button } from "@/components/ui/button"

export default function ErrorState({ onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border bg-card p-10 text-center">
      <h3 className="text-lg font-semibold">
        Something went wrong
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Unable to load contests. Please try again.
      </p>

      <Button
        className="mt-4"
        onClick={onRetry}
      >
        Retry
      </Button>
    </div>
  )
}
