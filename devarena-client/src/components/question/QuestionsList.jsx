/* eslint-disable no-unused-vars */
"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import {
  Search,
  Plus,
  ChevronRight,
  Zap,
  Code,
  Trophy,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { fetchQuestionsApi } from "@/apis/question-api"
import { useNavigate } from "react-router-dom"
import getDifficultyColor from "../helpers/colorDifficulty"
/* ---------------- Pagination Component ---------------- */

function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null

  return (
    <div className="flex justify-center items-center gap-2 mt-10 flex-wrap">
      <Button
        variant="outline"
        disabled={page === 0}
        onClick={() => onPageChange(page - 1)}
      >
        Prev
      </Button>

      {[...Array(totalPages)].map((_, i) => (
        <Button
          key={i}
          variant={i === page ? "default" : "outline"}
          onClick={() => onPageChange(i)}
        >
          {i + 1}
        </Button>
      ))}

      <Button
        variant="outline"
        disabled={page === totalPages - 1}
        onClick={() => onPageChange(page + 1)}
      >
        Next
      </Button>
    </div>
  )
}

/* ---------------- Main Page ---------------- */

export default function QuestionsPage() {
  const navigate = useNavigate()

  const [questions, setQuestions] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filter, setFilter] = useState("ALL")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const [pageInfo, setPageInfo] = useState({
    page: 0,
    size: 9,
    totalPages: 1,
    totalElements: 0,
  })

  /* ---------------- Navigation ---------------- */

  const handleCardClick = (slug) => {
    navigate(`/question/${slug}`)
  }

  const handleCreateNew = () => {
    navigate("/create-question")
  }

  /* ---------------- Fetch Questions ---------------- */

  const fetchQuestions = useCallback(async (pageNum = 0) => {
    try {
      setLoading(true)
      setError("")
      const data = await fetchQuestionsApi(pageNum, pageInfo.size)

      setQuestions(data.content)
      setPageInfo({
        page: data.number,
        size: data.size,
        totalPages: data.totalPages,
        totalElements: data.totalElements,
      })
    } catch {
      setError("Failed to fetch questions.")
    } finally {
      setLoading(false)
    }
  }, [pageInfo.size])

  useEffect(() => {
    fetchQuestions(0)
  }, [])

  const handlePageChange = (newPage) => {
    if (newPage < 0 || newPage >= pageInfo.totalPages) return
    fetchQuestions(newPage)
  }
  

  /* ---------------- Client-side Search/Filter (current page only) ---------------- */

  const filteredQuestions = useMemo(() => {
    return questions.filter(q => {
      const ql = searchQuery.toLowerCase()
      const matchesSearch =
        (q.title || "").toLowerCase().includes(ql) ||
        (q.description || "").toLowerCase().includes(ql)

      const matchesFilter =
        filter === "ALL" || q.difficulty === filter

      return matchesSearch && matchesFilter
    })
  }, [questions, searchQuery, filter])

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between gap-6 mb-10">
          <div>
            <h1 className="text-5xl font-black text-slate-900 dark:text-gray-100">
              Questions Library
            </h1>
            <p className="text-slate-600 dark:text-gray-400 mt-2">
              Practice competitive programming problems
            </p>
          </div>

          <Button
            onClick={handleCreateNew}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-6 rounded-xl"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Question
          </Button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="flex items-center rounded-xl px-5 py-4 border bg-white/80 dark:bg-gray-900/70">
            <Search className="w-5 h-5 text-slate-400 mr-3" />
            <Input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search questions..."
              className="border-0 focus:ring-0 bg-transparent"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          {["ALL", "EASY", "MEDIUM", "HARD"].map(d => (
            <button
              key={d}
              onClick={() => setFilter(d)}
              className={`px-4 py-2 rounded-lg font-semibold border
                ${filter === d
                  ? "bg-blue-600 text-white"
                  : "bg-white dark:bg-gray-900 text-slate-600 dark:text-gray-300"}
              `}
            >
              {d}
            </button>
          ))}
        </div>

        {/* Cards */}
        {loading ? (
          <div className="text-center text-slate-500">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQuestions.map(q => (
              <Card
                key={q.questionSlug}
                onClick={() => handleCardClick(q.questionSlug)}
                className="cursor-pointer bg-white/80 dark:bg-gray-900/70 hover:-translate-y-1 hover:shadow-xl transition"
              >
                <div className="p-6 space-y-4">
                  <div className="flex justify-between">
                    <h3 className="font-bold text-lg">
                      {q.title}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getDifficultyColor(q.difficulty)}`}>
                      {q.difficulty}
                    </span>
                  </div>

                  <p className="text-sm text-slate-600 dark:text-gray-400 line-clamp-2">
                    {q.description}
                  </p>

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">{q.score} pts</span>
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        <Pagination
          page={pageInfo.page}
          totalPages={pageInfo.totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  )
}
