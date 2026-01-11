"use client"

export const AppToast = ({ toast }) => {
  if (!toast) return null

  const colors = {
    success:
      "bg-primary/15 text-primary border border-primary/30",
    error:
      "bg-destructive/15 text-destructive border border-destructive/30",
    info:
      "bg-accent/15 text-accent border border-accent/30",
  }

  return (
    <div
      className={`
        fixed bottom-6 right-6
        px-4 py-3
        rounded-xl
        shadow-lg
        backdrop-blur-sm
        transition-colors
        ${colors[toast.type]}
      `}
    >
      {toast.message}
    </div>
  )
}
