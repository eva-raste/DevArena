export default function getDifficultyColor(difficulty){
    const map = {
      EASY: "bg-emerald-200 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
      MEDIUM: "bg-amber-200 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
      HARD: "bg-red-200 text-red-700 dark:bg-red-900/40 dark:text-red-300",
    }
    return map[difficulty] || map.EASY
  }