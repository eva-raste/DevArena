import { useState } from "react"
import { fetchQuestionCard } from "../../apis/question-api.js"

/* ---------- shared input styles ---------- */

const inputClass = `
  w-full
  bg-white dark:bg-[#020617]
  border border-gray-300 dark:border-slate-700
  rounded-lg
  px-4 py-2.5
  text-gray-900 dark:text-slate-100
  focus:outline-none
  focus:ring-2 focus:ring-indigo-500/40
  focus:border-indigo-500
`

const textareaClass = `
  ${inputClass}
  resize-y
`

/* ---------- component ---------- */

const ContestForm = ({
    pageTitle,
    submitLabel,
    initialForm,
    initialQuestions,
    onSubmit,
    loading,
    error,
    success,
}) => {
    const [form, setForm] = useState(
        initialForm ?? {
            title: "",
            visibility: "PUBLIC",
            instructions: "",
            startTime: "",
            endTime: "",
        }
    )

    const [contestQuestions, setContestQuestions] = useState(
        initialQuestions?.map((q, index) => ({
            question: q.question ?? q, // handles edit mode vs create mode
            score: q.score ?? "",
            orderIndex: q.orderIndex ?? index + 1
        })) ?? []
    )

    const [slugInput, setSlugInput] = useState("")
    const [questionError, setQuestionError] = useState(null)
    const [timeError, setTimeError] = useState(null)

    /* ---------- Time Validation ---------- */

    const validateTime = (updatedForm) => {
        const now = new Date()

        if (updatedForm.startTime) {
            const start = new Date(updatedForm.startTime)
            if (start < now) {
                return "Start time cannot be in the past"
            }
        }

        if (updatedForm.startTime && updatedForm.endTime) {
            const start = new Date(updatedForm.startTime)
            const end = new Date(updatedForm.endTime)
            if (end < start) {
                return "End time cannot be before start time"
            }
        }

        return null
    }

    const onChange = (e) => {
        const updatedForm = {
            ...form,
            [e.target.name]: e.target.value,
        }

        setForm(updatedForm)
        setTimeError(validateTime(updatedForm))
    }

    /* ---------- Question Slug ---------- */

    const handleSlugKeyDown = async (e) => {
        if (e.key !== "Enter") return
        e.preventDefault()

        if (!slugInput.trim()) return

        try {
            setQuestionError(null)

            const card = await fetchQuestionCard(slugInput.trim())

            if (
                contestQuestions.some(
                    q => q.question.questionSlug === card.questionSlug
                )
            ) {
                setQuestionError("Question already added")
                return
            }

            setContestQuestions(prev => [...prev, {
                question: card,
                score: "",
                orderIndex: prev.length + 1
            }])
            setSlugInput("")
        } catch (err) {
            setQuestionError(err.message)
        }
    }

    const removeQuestion = (slug) => {
        if (!window.confirm("Remove this question from contest?")) return
        setContestQuestions(prev =>
            prev
                .filter(q => q.question.questionSlug !== slug)
                .map((q, index) => ({
                    ...q,
                    orderIndex: index + 1
                }))
        )
    }

    /* ---------- Submit ---------- */

    const handleSubmit = async (e) => {
        e.preventDefault()

        // Time validation
        const validationError = validateTime(form)
        if (validationError) {
            setTimeError(validationError)
            return
        }

        // Question list cannot be empty
        if (contestQuestions.length === 0) {
            setQuestionError("At least one question is required")
            return
        }

        // Validate scores
        for (let cq of contestQuestions) {
            if (!cq.score || Number(cq.score) <= 0) {
                setQuestionError(
                    `Score must be greater than 0 for ${cq.question.title}`
                )
                return
            }
        }

        // Duplicate safety (extra protection)
        const slugs = contestQuestions.map(q => q.question.questionSlug)
        const uniqueSlugs = new Set(slugs)

        if (slugs.length !== uniqueSlugs.size) {
            setQuestionError("Duplicate questions are not allowed")
            return
        }

        setQuestionError(null)

        const payload = {
            title: form.title,
            visibility: form.visibility,
            instructions: form.instructions || null,
            startTime: form.startTime || null,
            endTime: form.endTime || null,
            questions: contestQuestions.map(cq => ({
                questionSlug: cq.question.questionSlug,
                score: Number(cq.score),
                orderIndex: cq.orderIndex
            }))
        }

        await onSubmit(payload)
    }


    const updateScore = (slug, value) => {
        setContestQuestions(prev =>
            prev.map(cq =>
                cq.question.questionSlug === slug
                    ? { ...cq, score: value }
                    : cq
            )
        )
    }


    /* ---------- UI ---------- */

    return (
        <div
            className=" min-h-screen bg-gray-50 dark:bg-gradient-to-br dark:from-[#020617] dark:via-[#020617] dark:to-[#020617] px-4 sm:px-6 py-14 flex justify-center "
        >
            <div className="w-full max-w-3xl">
                <h1 className="text-3xl font-semibold text-gray-900 dark:text-slate-100 mb-8">
                    {pageTitle}
                </h1>

                <form
                    onSubmit={handleSubmit}
                    className=" bg-white dark:bg-[#0f172a]/90 backdrop-blur border border-gray-200 dark:border-slate-700/60 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl "
                >
                    {/* Title */} <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                            Contest Title
                        </label>
                        <input
                            name="title"
                            value={form.title}
                            onChange={onChange}
                            required
                            className={inputClass}
                        />
                    </div>

                    {/* Visibility */}
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                            Visibility
                        </label>
                        <select
                            name="visibility"
                            value={form.visibility}
                            onChange={onChange}
                            className={inputClass}
                        >
                            <option value="PUBLIC">Public</option>
                            <option value="PRIVATE">Private</option>
                        </select>
                    </div>
                    {/* Add Question */}
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                            Add Question (by slug)
                        </label>
                        <input
                            placeholder="question-slug"
                            value={slugInput}
                            onChange={(e) => setSlugInput(e.target.value)}
                            onKeyDown={handleSlugKeyDown}
                            className={inputClass}
                        />
                    </div>

                    {questionError && (
                        <p className="text-sm text-red-500 dark:text-red-400">
                            {questionError}
                        </p>
                    )}

                    {/* Question Cards */}
                    {contestQuestions.length > 0 && (
                        <div className="space-y-3">
                            <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                                Added Questions
                            </label>

                            {contestQuestions.map((cq) => {
                                const q = cq.question

                                return (
                                    <div
                                        key={q.questionSlug}
                                        className=" bg-gray-50 dark:bg-[#020617] border border-gray-200 dark:border-slate-700/60 rounded-xl p-4 "
                                    >
                                        <div className="flex justify-between gap-4">
                                            <div>
                                                <h3 className="text-gray-900 dark:text-slate-100 font-medium">
                                                    {q.title}
                                                </h3>
                                                <div className="flex items-center gap-4 mt-2">
                                                    <p className="text-xs text-gray-500 dark:text-slate-400">
                                                        {q.questionSlug} • {q.difficulty}
                                                    </p>

                                                    <div className="flex items-center gap-2">
                                                        <label className="text-xs text-gray-600 dark:text-slate-400">
                                                            Score
                                                        </label>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            value={cq.score}
                                                            onChange={(e) =>
                                                                updateScore(q.questionSlug, e.target.value)
                                                            }
                                                            className="w-20 px-2 py-1 text-sm rounded border border-gray-300 dark:border-slate-700 bg-white dark:bg-[#020617] text-gray-900 dark:text-slate-100"
                                                        />
                                                    </div>
                                                </div>

                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => removeQuestion(q.questionSlug)}
                                                className="text-red-600 dark:text-red-400 hover:underline"
                                            >
                                                Remove
                                            </button>
                                        </div>

                                        <p className="text-sm text-gray-700 dark:text-slate-300 mt-3 line-clamp-2">
                                            {q.description}
                                        </p>
                                    </div>
                                )
                            })}
                        </div>
                    )}


                    {/* Instructions */}
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                            Instructions
                        </label>
                        <textarea
                            name="instructions"
                            rows={3}
                            value={form.instructions}
                            onChange={onChange}
                            className={textareaClass}
                        />
                    </div>

                    {/* Time */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                                Start Time
                            </label>
                            <input
                                type="datetime-local"
                                name="startTime"
                                value={form.startTime}
                                onChange={onChange}
                                className={inputClass}
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                                End Time
                            </label>
                            <input
                                type="datetime-local"
                                name="endTime"
                                value={form.endTime}
                                onChange={onChange}
                                className={inputClass}
                            />
                        </div>
                    </div>

                    {timeError && (
                        <p className="text-sm text-red-400">{timeError}</p>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="
            w-full
            bg-indigo-600
            hover:bg-indigo-700
            text-white
            py-2.5
            rounded-lg
            font-medium
            disabled:opacity-50
            disabled:cursor-not-allowed
          "
                    >
                        {loading ? "Saving..." : submitLabel}
                    </button>

                    {error && (
                        <p className="text-sm text-red-500 dark:text-red-400">
                            {error}
                        </p>
                    )}
                    {success && (
                        <p className="text-sm text-green-600 dark:text-green-400">
                            {success}
                        </p>
                    )}
                </form>
            </div>
        </div>
    )

}

export default ContestForm
