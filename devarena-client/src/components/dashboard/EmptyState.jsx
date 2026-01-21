import { Button } from "@/components/ui/button"

export default function EmptyState({ title, description, onReset }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border bg-card p-10 text-center">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        {description}
      </p>

      {onReset && (
        <Button
          variant="outline"
          className="mt-4"
          onClick={onReset}
        >
          Reset filters
        </Button>
      )}
    </div>
  )
}
