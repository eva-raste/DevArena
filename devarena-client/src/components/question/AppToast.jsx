"use client"

export const AppToast = ({ toast }) => {
  if (!toast) return null

  const colors = {
    success: "bg-green-500/20 text-green-400 border-green-500/30",
    error: "bg-red-500/20 text-red-400 border-red-500/30",
    info: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  }

  return (
    <div
      className={`fixed bottom-6 right-6 px-4 py-3 rounded-xl border shadow-lg ${colors[toast.type]}`}
    >
      {toast.message}
    </div>
  )
}
