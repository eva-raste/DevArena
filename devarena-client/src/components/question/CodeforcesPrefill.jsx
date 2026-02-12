"use client"

import { useState, useCallback } from "react"
import { generateUUID } from "../../apis/question-utils"
import { fetchCodeforcesQuestionApi } from "@/apis/question-api"

export const CodeforcesPrefill = ({ onPrefillSuccess }) => {
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const normalizeSlug = (value) => {
    const trimmed = value.trim()
    if (!trimmed) return ""

    const match = trimmed.match(
      /codeforces\.com\/problemset\/problem\/(\d+)\/([A-Z0-9]+)/i
    )
    if (match) return `${match[1]}/${match[2]}`

    return trimmed
  }

  const handleFetch = useCallback(async () => {
    const slug = normalizeSlug(input)

    if (!slug) {
      setError("Enter a valid Codeforces problem reference")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const data = await fetchCodeforcesQuestionApi(slug)

      const mapTestcases = (list = []) =>
        list.map(tc => ({
          id: generateUUID(),
          input: tc.input ?? "",
          output: tc.output ?? "",
          explanation: tc.explanation ?? "",
        }))

      onPrefillSuccess({
        title: data.title ?? "",
        questionSlug: data.questionSlug ?? slug.replace("/", "-").toLowerCase(),
        description: data.description ?? "",
        constraints: data.constraints ?? "",
        difficulty: data.difficulty ?? "",
        score: data.score ?? 0,
        sampleTestcases: mapTestcases(data.sampleTestcases),
        hiddenTestcases: [],
      })

      setInput("")
    } catch (err) {
      setError(err?.message || "Failed to fetch Codeforces problem")
    } finally {
      setLoading(false)
    }
  }, [input, onPrefillSuccess])

  return (
    <div 
      className=" w-1/2
        p-4 rounded-2xl border
        bg-white border-gray-200
        dark:bg-gray-900/40 dark:border-gray-700
        transition-colors
      "
    >
      <div className="flex gap-2 w-full">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="852/A or Codeforces problem URL"
          className="
            
            flex-1 rounded-xl px-4 py-2 border outline-none
            bg-white text-gray-900 border-gray-300
            focus:border-teal-500
            dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700
            transition-colors
          "
        />

        <button
          type="button"
          onClick={handleFetch}
          disabled={loading}
          className="
            px-4 py-2 rounded-xl font-medium
            bg-teal-500 text-white
            hover:bg-teal-600
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors
          "
        >
          {loading ? "Fetching..." : "Fetch"}
        </button>
      </div>

      {error && (
        <p className="text-sm mt-2 text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  )
}
