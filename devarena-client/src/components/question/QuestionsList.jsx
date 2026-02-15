/* eslint-disable no-unused-vars */
"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import {
    Search,
    Plus,
    ChevronRight,
    Pencil,
    Trash2
} from "lucide-react"
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { deleteQuestionApi, fetchQuestionsApi } from "@/apis/question-api"
import { useNavigate } from "react-router-dom"
import getDifficultyColor from "../helpers/colorDifficulty"

/* ---------------- Pagination Component ---------------- */

function Pagination({ page, totalPages, onPageChange }) {
    if (totalPages < 1) return null

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
    const [deleteSlug, setDeleteSlug] = useState(null)

    const [pageInfo, setPageInfo] = useState({
        page: 0,
        size: 10,
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

    /* ---------------- Fetch Questions (SERVER FILTERED) ---------------- */

    const fetchQuestions = useCallback(
        async (pageNum = 0, difficulty) => {
            try {
                setLoading(true)
                setError("")
                //  console.log("FETCHING:", {
                //         page: pageNum,
                //         size: pageInfo.size,
                //         difficulty,
                //       })
                const data = await fetchQuestionsApi(
                    pageNum,
                    pageInfo.size,
                    difficulty
                )
                // console.log(data);
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
        },
        [pageInfo.size]
    )

    useEffect(() => {
        const difficulty = filter === "ALL" ? undefined : filter
        fetchQuestions(0, difficulty)
    }, [filter])

    const handlePageChange = (newPage) => {
        if (newPage < 0 || newPage >= pageInfo.totalPages) return
        const difficulty = filter === "ALL" ? undefined : filter
        fetchQuestions(newPage, difficulty)
    }


    const onDelete = async (slug) => {
        await deleteQuestionApi(slug)
        setQuestions(prev =>
            prev.filter(q => q.questionSlug !== slug)
        )
    }

    /* ---------------- Client-side Search ONLY ---------------- */

    const filteredQuestions = useMemo(() => {
        const ql = searchQuery.toLowerCase()

        return questions.filter(q =>
            (q.title || "").toLowerCase().includes(ql) ||
            (q.description || "").toLowerCase().includes(ql)
        )
    }, [questions, searchQuery])

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

                {/* Difficulty Filters */}
                <div className="flex flex-wrap gap-3 mb-6">
                    {["ALL", "EASY", "MEDIUM", "HARD"].map(d => (
                        <button
                            key={d}
                            onClick={() => setFilter(d)}

                            className={`px-4 py-2 rounded-lg font-semibold border
                                ${filter === d
                                    ? "bg-blue-600 text-white"
                                    : "bg-white dark:bg-gray-900 text-slate-600 dark:text-gray-300"
                                }`}
                        >
                            {d}
                        </button>
                    ))}
                </div>

                <AlertDialog open={!!deleteSlug} onOpenChange={() => setDeleteSlug(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                Delete this question?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>

                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                className="bg-red-600 hover:bg-red-700"
                                onClick={() => {
                                    onDelete(deleteSlug)
                                    setDeleteSlug(null)
                                }}
                            >
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

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
                                    <div className="flex items-start justify-between gap-4">

                                        <h3 className="font-bold text-lg leading-tight">
                                            {q.title}
                                        </h3>

                                        <div className="flex items-center gap-2">
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-bold ${getDifficultyColor(q.difficulty)}`}
                                            >
                                                {q.difficulty}
                                            </span>

                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    navigate(`/questions/${q.questionSlug}/edit`)
                                                }}
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </Button>

                                            {q.role === "OWNER" && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-red-500 hover:text-red-600"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        setDeleteSlug(q.questionSlug)
                                                    }}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            )}

                                        </div>
                                    </div>


                                    <h2 className="font-bold text-sm leading-tight">
                                        {q.questionSlug}
                                    </h2>
                                    <span
                                        className={`
                                            inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold
                                            ${q.role === "OWNER"
                                                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                                : "bg-blue-500/15 text-blue-400 border border-blue-500/30"
                                            }
                                          `}
                                    >
                                        {q.role}
                                    </span>
                                    <p className="text-sm text-slate-600 dark:text-gray-400 line-clamp-2">
                                        {q.description}
                                    </p>

                                
                                </div>
                            </Card>
                        ))}
                    </div>
                )}

                <Pagination
                    page={pageInfo.page}
                    totalPages={pageInfo.totalPages}
                    onPageChange={handlePageChange}
                />
            </div>
        </div>
    )
}
