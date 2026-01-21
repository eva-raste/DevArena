import { Button } from "@/components/ui/button"

export default function PaginationControls({ page, totalPages, onPageChange }) {
  return (
    <div className="flex items-center justify-center gap-4">
      <Button
        variant="outline"
        disabled={page === 0}
        onClick={() => onPageChange(page - 1)}
      >
        Prev
      </Button>

      <span className="text-sm text-muted-foreground">
        Page {page + 1} of {totalPages}
      </span>

      <Button
        variant="outline"
        disabled={page + 1 >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Next
      </Button>
    </div>
  )
}
