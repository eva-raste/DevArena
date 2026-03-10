import { useState, useEffect, useCallback } from "react"
import { fetchQuestionCard } from "../../apis/question-api.js"
import { removeModifierApi } from "../../apis/contest-api"
import { verifyUserApi } from "../../apis/user-api"

/* ─── shared input styles ───────────────────────────────────────────────── */

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
  transition-colors
`.trim()

const textareaClass = `${inputClass} resize-y`

/*  helpers  */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/


const validateContestForm = (form, contestQuestions) => {
  // Title
  if (!form.title || form.title.trim().length < 3) {
    return "Contest title must be at least 3 characters."
  }

  // Visibility
  if (!["PUBLIC", "PRIVATE"].includes(form.visibility)) {
    return "Invalid visibility option."
  }

  // Questions
  if (!contestQuestions || contestQuestions.length === 0) {
    return "At least one question is required."
  }

  // Duplicate questions
  const slugs = contestQuestions.map(q => q.question.questionSlug)
  if (new Set(slugs).size !== slugs.length) {
    return "Duplicate questions are not allowed."
  }

  // Scores
  for (const cq of contestQuestions) {
    if (!cq.score || Number(cq.score) <= 0) {
      return `Score must be greater than 0 for "${cq.question.title}".`
    }
  }

  // Times required
  if (!form.startTime || !form.endTime) {
    return "Start time and End time are required."
  }

  const now = new Date()
  const start = new Date(form.startTime)
  const end = new Date(form.endTime)

  if (start < now) return "Start time cannot be in the past."
  if (end <= start) return "End time must be after start time."

  // Instructions limit
  if (form.instructions && form.instructions.length > 2000) {
    return "Instructions too long (max 2,000 characters)."
  }

  return null
}

/*  component  */

const ContestForm = ({
  pageTitle,
  roomId,            // present only in edit mode
  submitLabel = "Save",
  initialForm,
  initialQuestions,
  initialModifiers,
  role,
  onSubmit,
  loading = false,
  error,
  success,
}) => {
  /* ── form state ── */
  const [form, setForm] = useState(() => ({
    title: "",
    visibility: "PUBLIC",
    instructions: "",
    startTime: "",
    endTime: "",
    ...initialForm,
  }))

  // Sync when parent provides initialForm late (e.g. after async fetch)
  useEffect(() => {
    if (initialForm) setForm(initialForm)
  }, [initialForm])

  /*  questions state  */
  const [contestQuestions, setContestQuestions] = useState(() =>
    (initialQuestions ?? []).map((q, index) => ({
      question: q.question ?? q,
      score: q.score ?? "",
      orderIndex: q.orderIndex ?? index + 1,
    }))
  )

  /*  modifiers state  */
  const normaliseModifier = m => ({
    email: m.email ?? m,
    username: m.username ?? null,
  })

  const [modifiers, setModifiers] = useState(() =>
    (initialModifiers ?? []).map(normaliseModifier)
  )

  // Sync when parent provides initialModifiers late
  useEffect(() => {
    if (initialModifiers) {
      setModifiers(initialModifiers.map(normaliseModifier))
    }
  }, [initialModifiers])

  /*  local error / input state  */
  const [formError, setFormError] = useState(null)   
  const [timeError, setTimeError] = useState(null)
  const [slugInput, setSlugInput] = useState("")
  const [questionError, setQuestionError] = useState(null)
  const [modifierInput, setModifierInput] = useState("")
  const [modifierError, setModifierError] = useState(null)
  const [verifyingModifier, setVerifyingModifier] = useState(false)

  /*  time validation (onChange)  */
  const validateTime = useCallback((updatedForm) => {
    const now = new Date()

    if (updatedForm.startTime) {
      const start = new Date(updatedForm.startTime)
      if (start < now) return "Start time cannot be in the past."
    }

    if (updatedForm.startTime && updatedForm.endTime) {
      const start = new Date(updatedForm.startTime)
      const end = new Date(updatedForm.endTime)
      if (end <= start) return "End time cannot be before start time."
    }

    return null
  }, [])

  const onChange = (e) => {
    const updatedForm = { ...form, [e.target.name]: e.target.value }
    setForm(updatedForm)
    setTimeError(validateTime(updatedForm))
  }

  /*  question slug  */
  const handleSlugKeyDown = async (e) => {
    if (e.key !== "Enter") return
    e.preventDefault()

    const slug = slugInput.trim()
    if (!slug) return

    setQuestionError(null)

    try {
      const card = await fetchQuestionCard(slug)

      if (contestQuestions.some(q => q.question.questionSlug === card.questionSlug)) {
        setQuestionError("Question already added.")
        return
      }

      setContestQuestions(prev => [
        ...prev,
        { question: card, score: "", orderIndex: prev.length + 1 },
      ])
      setSlugInput("")
    } catch (err) {
      setQuestionError(err.message ?? "Failed to fetch question.")
    }
  }

  const removeQuestion = (slug) => {
    if (!window.confirm("Remove this question from the contest?")) return
    setContestQuestions(prev =>
      prev
        .filter(q => q.question.questionSlug !== slug)
        .map((q, index) => ({ ...q, orderIndex: index + 1 }))
    )
  }

  const updateScore = (slug, value) => {
    setContestQuestions(prev =>
      prev.map(cq =>
        cq.question.questionSlug === slug ? { ...cq, score: value } : cq
      )
    )
  }

  /*  modifiers  */
  const handleVerifyModifier = async () => {
    const email = modifierInput.trim()
    if (!email) return

    if (!EMAIL_REGEX.test(email)) {
      setModifierError("Please enter a valid email address.")
      return
    }

    if (modifiers.some(m => m.email === email)) {
      setModifierError("This modifier has already been added.")
      return
    }

    setModifierError(null)
    setVerifyingModifier(true)

    try {
      const user = await verifyUserApi(email)
      setModifiers(prev => [...prev, { email: user.email, username: user.username }])
      setModifierInput("")
    } catch (err) {
      const code = err.response?.data?.message

      if (code === "OWNER_CANNOT_BE_MODIFIER") {
        setModifierError("You cannot add yourself as a modifier.")
      } else if (code === "User not found") {
        setModifierError("No user found with that email.")
      } else {
        setModifierError("Verification failed. Please try again.")
      }
    } finally {
      setVerifyingModifier(false)
    }
  }


  const removeModifier = async (email) => {
    setModifierError(null)

    if (roomId) {
      try {
        await removeModifierApi(roomId, email)
      } catch (err) {
        setModifierError(
          err.response?.data?.message ?? "Failed to remove modifier."
        )
        return
      }
    }

    setModifiers(prev => prev.filter(m => m.email !== email))
  }

  /*  submit  */
  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError(null)

    const validationError = validateContestForm(form, contestQuestions)

    if (validationError) {
      setFormError(validationError)
      return
    }

    // Also block if the user left a pending time-conflict warning
    if (timeError) {
      setFormError(timeError)
      return
    }

    const payload = {
      title: form.title.trim(),
      visibility: form.visibility,
      instructions: form.instructions?.trim() || null,
      startTime: form.startTime,
      endTime: form.endTime,
      modifiers: modifiers.map(m => m.email),
      questions: contestQuestions.map((cq, index) => ({
        questionSlug: cq.question.questionSlug,
        score: Number(cq.score),
        orderIndex: cq.orderIndex ?? index + 1,
      })),
    }

    await onSubmit(payload)
  }

  /*  render  */
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gradient-to-br dark:from-[#020617] dark:via-[#020617] dark:to-[#020617] px-4 sm:px-6 py-14 flex justify-center">
      <div className="w-full max-w-3xl">
        <h1 className="text-3xl font-semibold text-gray-900 dark:text-slate-100 mb-8">
          {pageTitle}
        </h1>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="bg-white dark:bg-[#0f172a]/90 backdrop-blur border border-gray-200 dark:border-slate-700/60 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl"
        >
          {/* Title */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
              Contest Title
            </label>
            <input
              name="title"
              value={form.title}
              onChange={onChange}
              required
              minLength={3}
              placeholder="My Awesome Contest"
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

          {/* Modifiers */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
              Modifiers
            </label>

            {role === "OWNER" && (
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="user@email.com"
                  value={modifierInput}
                  onChange={(e) => {
                    setModifierInput(e.target.value)
                    setModifierError(null)
                  }}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleVerifyModifier())}
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={handleVerifyModifier}
                  disabled={verifyingModifier || !modifierInput.trim()}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                >
                  {verifyingModifier ? "Verifying…" : "Verify"}
                </button>
              </div>
            )}

            {modifierError && (
              <p className="text-sm text-red-500">{modifierError}</p>
            )}

            {modifiers.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {modifiers.map(m => (
                  <span
                    key={m.email}
                    className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-full text-xs flex items-center gap-2"
                  >
                    {m.username ?? m.email}
                    {role === "OWNER" && (
                      <button
                        type="button"
                        aria-label={`Remove ${m.username ?? m.email}`}
                        onClick={() => removeModifier(m.email)}
                        className="text-red-500 hover:text-red-700 transition-colors leading-none"
                      >
                        ×
                      </button>
                    )}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Add Question by Slug */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
              Add Question{" "}
              <span className="text-gray-400 dark:text-slate-500 font-normal">
                (press Enter after typing a slug)
              </span>
            </label>
            <input
              placeholder="question-slug"
              value={slugInput}
              onChange={(e) => {
                setSlugInput(e.target.value)
                setQuestionError(null)
              }}
              onKeyDown={handleSlugKeyDown}
              className={inputClass}
            />
            {questionError && (
              <p className="text-sm text-red-500 dark:text-red-400">{questionError}</p>
            )}
          </div>

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
                    className="bg-gray-50 dark:bg-[#020617] border border-gray-200 dark:border-slate-700/60 rounded-xl p-4"
                  >
                    <div className="flex justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="text-gray-900 dark:text-slate-100 font-medium truncate">
                          {q.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-4 mt-2">
                          <p className="text-xs text-gray-500 dark:text-slate-400">
                            {q.questionSlug} • {q.difficulty}
                          </p>

                          <div className="flex items-center gap-2">
                            <label
                              htmlFor={`score-${q.questionSlug}`}
                              className="text-xs text-gray-600 dark:text-slate-400"
                            >
                              Score
                            </label>
                            <input
                              id={`score-${q.questionSlug}`}
                              type="number"
                              min="1"
                              step="1"
                              value={cq.score}
                              onChange={(e) => updateScore(q.questionSlug, e.target.value)}
                              className="w-20 px-2 py-1 text-sm rounded border border-gray-300 dark:border-slate-700 bg-white dark:bg-[#020617] text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeQuestion(q.questionSlug)}
                        className="text-red-600 dark:text-red-400 hover:underline text-sm shrink-0"
                      >
                        Remove
                      </button>
                    </div>

                    {q.description && (
                      <p className="text-sm text-gray-700 dark:text-slate-300 mt-3 line-clamp-2">
                        {q.description}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Instructions */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
              Instructions{" "}
              <span className="text-gray-400 dark:text-slate-500 font-normal">
                (optional, max 2,000 chars)
              </span>
            </label>
            <textarea
              name="instructions"
              rows={3}
              value={form.instructions}
              onChange={onChange}
              maxLength={2000}
              className={textareaClass}
            />
            <p className="text-xs text-right text-gray-400 dark:text-slate-500">
              {(form.instructions ?? "").length} / 2,000
            </p>
          </div>

          {/* Start / End Time */}
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
            disabled={loading || !!timeError}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Saving…" : submitLabel}
          </button>

          {/* Form-level error (from local validation) */}
          {formError && (
            <p className="text-sm text-red-500 dark:text-red-400">{formError}</p>
          )}

          {/* API-level error / success (from parent) */}
          {error && (
            <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
          )}
          {success && (
            <p className="text-sm text-green-600 dark:text-green-400">{success}</p>
          )}
        </form>
      </div>
    </div>
  )
}

export default ContestForm