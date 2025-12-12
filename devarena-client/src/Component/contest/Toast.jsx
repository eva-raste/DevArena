export const Toast = ({ toast }) => {
  if (!toast) return null

  return (
    <div
      className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 ${
        toast.type === "success" ? "bg-teal-500" : toast.type === "error" ? "bg-red-500" : "bg-blue-500"
      }`}
      style={{ animation: "fadeSlideIn 0.3s ease-out" }}
    >
      <span className="text-white font-medium">{toast.message}</span>
    </div>
  )
}
