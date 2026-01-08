"use client"

import { useState, useCallback } from "react"
import { generateUUID } from "../../apis/question-utils"
import { fetchCodeforcesQuestionApi } from "@/apis/question-api"

export const CodeforcesPrefill = ({ onPrefillSuccess }) => {
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Extract "852/A" from URL or raw input
  const normalizeSlug = (value) => {
    const trimmed = value.trim()
    if (!trimmed) return ""

    // URL case
    const match = trimmed.match(/codeforces\.com\/problemset\/problem\/(\d+)\/([A-Z0-9]+)/i)
    if (match) return `${match[1]}/${match[2]}`

    return trimmed // assume already "852/A"
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
        hiddenTestcases: [], // CF never provides hidden cases
      })

      setInput("")
    } catch (err) {
      setError(err?.message || "Failed to fetch Codeforces problem")
    } finally {
      setLoading(false)
    }
  }, [input, onPrefillSuccess])

  return (
    <div className="p-4 rounded-2xl border border-gray-700 bg-gray-900/40">
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="852/A or Codeforces problem URL"
          className="flex-1 bg-gray-900 text-gray-100 rounded-xl px-4 py-2 border border-gray-700 focus:border-teal-500 outline-none"
        />

        <button
          type="button"
          onClick={handleFetch}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-600 disabled:opacity-50"
        >
          {loading ? "Fetching..." : "Fetch"}
        </button>
      </div>

      {error && (
        <p className="text-sm text-red-400 mt-2">{error}</p>
      )}
    </div>
  )
}
