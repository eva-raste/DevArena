"use client"


export const PublishModal = ({ question, onClose, onCopy, onConfirm }) => {

  return (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center p-4"
    role="dialog"
    aria-modal="true"
  >
    <div
      className="absolute inset-0 bg-background/80 backdrop-blur-sm"
      onClick={onClose}
    />

    <div className="relative max-w-3xl w-full bg-card/80 rounded-3xl p-6 shadow-2xl border border-border">
      <h3 className="text-xl font-bold mb-3 text-foreground">
        Confirm Publish
      </h3>

      <p className="text-sm text-muted-foreground mb-4">
        Review the JSON payload below. Click{" "}
        <span className="font-semibold text-foreground">
          Confirm Publish
        </span>{" "}
        to call the publish handler.
      </p>

      <div className="bg-card/40 p-4 rounded-lg max-h-[420px] overflow-auto mb-4 border border-border">
        <pre className="whitespace-pre-wrap text-sm font-mono text-foreground">
          {JSON.stringify(question, null, 2)}
        </pre>
      </div>

      <div className="flex items-center justify-end gap-3">
        <button
          onClick={() => onCopy(JSON.stringify(question, null, 2))}
          className="
            px-4 py-2
            bg-muted hover:bg-muted/80
            text-foreground
            rounded-2xl
            text-sm
            transition-all
          "
        >
          Copy JSON
        </button>

        <button
          onClick={onClose}
          className="
            px-4 py-2
            bg-muted/70 hover:bg-muted
            text-foreground
            rounded-2xl
            text-sm
            transition-all
          "
        >
          Cancel
        </button>

        <button
          onClick={onConfirm}
          className="
            px-4 py-2
            bg-primary hover:bg-primary/90
            text-primary-foreground
            rounded-2xl
            text-sm
            shadow-lg
            transition-all
          "
        >
          Confirm Publish
        </button>
      </div>
    </div>
  </div>
)

}
