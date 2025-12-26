export function formatDate(date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

export function formatDistanceToNow(date){
  const now = new Date()
  const diffMs = date.getTime() - now.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return "now"
  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? "s" : ""}`
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? "s" : ""}`
  return `${diffDays} day${diffDays !== 1 ? "s" : ""}`
}
