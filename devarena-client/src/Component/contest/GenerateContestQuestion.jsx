"use client"

import { useState, useEffect, useCallback } from "react"
import { generateUUID, slugify, validateQuestion } from "../../lib/question-utils"
import { Toast } from "./Toast"
import { QuestionForm } from "./QuestionForm"
import { LivePreview } from "./LivePreview"
import { JsonPreview } from "./JsonPreview"
import { PublishModal } from "./PublishModal"
const GenerateContestQuestion = ({
  onSaveDraft = () => {},
  onPublish = () => {},
  existingSlugs = [],
  demo = false,
}) => {
  const demoData = {
    questionId: generateUUID(),
    question_slug: "Two-Sum",
    title: "Two Sum",
    description:
      "## Problem\nGiven an array of integers `nums` and an integer `target`, return indices of the two numbers that add up to `target`.\n\n**Example:**\n```\nInput: nums = [2,7,11,15], target = 9\nOutput: [0,1]\n```",
    difficulty: "easy",
    score: 100,
    constraints: "n == nums.length\n2 <= n <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9",
    sampleTestcases: [
      { id: generateUUID(), input: "[2,7,11,15]\\n9", output: "[0,1]" },
      { id: generateUUID(), input: "[3,2,4]\\n6", output: "[1,2]" },
    ],
    hiddenTestcases: [{ id: generateUUID(), input: "[3,3]\\n6", output: "[0,1]" }],
  }

  const emptyState = {
    questionId: generateUUID(),
    question_slug: "",
    title: "",
    description: "",
    difficulty: "",
    score: 0,
    constraints: "",
    sampleTestcases: [],
    hiddenTestcases: [],
  }

  const [question, setQuestion] = useState(demo ? demoData : emptyState)
  const [errors, setErrors] = useState([])
  const [showPublishModal, setShowPublishModal] = useState(false)
  const [showConstraintsGuide, setShowConstraintsGuide] = useState(false)
  const [toast, setToast] = useState(null)
  const [slugWarning, setSlugWarning] = useState(false)
  const [lastAddedSampleId, setLastAddedSampleId] = useState(null)
  const [lastAddedHiddenId, setLastAddedHiddenId] = useState(null)

  const [scoreInput, setScoreInput] = useState(demo ? "100" : "")

  useEffect(() => {
    const newSlug = slugify(question.title || "")
    setQuestion((prev) => {
      const currentSlug = prev.question_slug || ""
      if (!currentSlug || currentSlug === slugify(prev.title)) {
        return { ...prev, question_slug: newSlug }
      }
      return prev
    })
  }, [question.title])

  useEffect(() => {
    if (question.question_slug && existingSlugs.includes(question.question_slug)) {
      setSlugWarning(true)
    } else {
      setSlugWarning(false)
    }
  }, [question.question_slug, existingSlugs])

  const showToast = useCallback((message, type = "info") => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 2500)
  }, [])

  const handleInputChange = useCallback((field, value) => {
    setQuestion((prev) => ({ ...prev, [field]: value }))
  }, [])

  const handleScoreInputChange = useCallback((e) => {
    const value = e.target.value
    // Allow empty string or numeric values only
    if (value === "" || /^\d+$/.test(value)) {
      setScoreInput(value)
      const numValue = value === "" ? 0 : Number.parseInt(value, 10)
      setQuestion((prev) => ({ ...prev, score: numValue }))
    }
  }, [])

  const makeSlugUnique = useCallback(() => {
    const baseSlug = question.question_slug || slugify(question.title || "question")
    let counter = 1
    let newSlug = `${baseSlug}-${counter}`

    while (existingSlugs.includes(newSlug)) {
      counter++
      newSlug = `${baseSlug}-${counter}`
    }

    setQuestion((prev) => ({ ...prev, question_slug: newSlug }))
    showToast("Slug made unique", "success")
  }, [question.question_slug, question.title, existingSlugs, showToast])

  const addTestcase = useCallback((type) => {
    const newTestcase = { id: generateUUID(), input: "", output: "" }
    setQuestion((prev) => ({
      ...prev,
      [type]: [...(prev[type] || []), newTestcase],
    }))
    if (type === "sampleTestcases") {
      setLastAddedSampleId(newTestcase.id)
    } else {
      setLastAddedHiddenId(newTestcase.id)
    }
  }, [])

  const removeTestcase = useCallback((type, id) => {
    setQuestion((prev) => ({
      ...prev,
      [type]: prev[type].filter((tc) => tc.id !== id),
    }))
  }, [])

  const duplicateTestcase = useCallback((type, testcase) => {
    const newTestcase = {
      id: generateUUID(),
      input: testcase.input,
      output: testcase.output,
    }
    setQuestion((prev) => ({
      ...prev,
      [type]: [...(prev[type] || []), newTestcase],
    }))
    if (type === "sampleTestcases") {
      setLastAddedSampleId(newTestcase.id)
    } else {
      setLastAddedHiddenId(newTestcase.id)
    }
  }, [])

  const moveTestcase = useCallback((type, index, direction) => {
    setQuestion((prev) => {
      const arr = [...(prev[type] || [])]
      const newIndex = direction === "up" ? index - 1 : index + 1

      if (newIndex < 0 || newIndex >= arr.length) return prev
      ;[arr[index], arr[newIndex]] = [arr[newIndex], arr[index]]
      return { ...prev, [type]: arr }
    })
  }, [])

  const updateTestcase = useCallback((type, id, field, value) => {
    setQuestion((prev) => ({
      ...prev,
      [type]: prev[type].map((tc) => (tc.id === id ? { ...tc, [field]: value } : tc)),
    }))
  }, [])

  const handleValidate = useCallback(() => {
    const validationErrors = validateQuestion(question)
    setErrors(validationErrors)

    if (validationErrors.length === 0) {
      showToast("Validation passed!", "success")
    } else {
      showToast(`${validationErrors.length} validation error(s)`, "error")
    }
  }, [question, showToast])

  const handleSaveDraft = useCallback(() => {
    onSaveDraft(question)
    showToast("Draft saved", "success")
  }, [question, onSaveDraft, showToast])

  const handlePublishClick = useCallback(() => {
    const validationErrors = validateQuestion(question)
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      showToast("Please fix validation errors first", "error")
      return
    }
    setShowPublishModal(true)
  }, [question, showToast])

  const confirmPublish = useCallback(() => {
    onPublish(question)
    setShowPublishModal(false)
    showToast("Question published!", "success")
  }, [question, onPublish, showToast])

  const copyToClipboard = useCallback(
    async (text) => {
      try {
        await navigator.clipboard.writeText(text)
        showToast("Copied to clipboard", "success")
      } catch {
        showToast("Unable to copy", "error")
      }
    },
    [showToast],
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100 p-4 md:p-8">
      <style>
        {`
          @keyframes fadeSlideIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          @keyframes gradientBorder {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
          
          .animated-border {
            position: relative;
          }
          
          .animated-border::before {
            content: '';
            position: absolute;
            inset: -2px;
            border-radius: 24px;
            padding: 2px;
            background: linear-gradient(90deg, #14b8a6, #8b5cf6, #14b8a6);
            background-size: 200% 100%;
            -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            -webkit-mask-composite: xor;
            mask-composite: exclude;
            animation: gradientBorder 3s ease infinite;
            opacity: 0.5;
            pointer-events: none;
          }
        `}
      </style>

      <Toast toast={toast} />

      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-teal-400 to-purple-500 bg-clip-text text-transparent">
          Generate Contest Question
        </h1>

        <div className="grid lg:grid-cols-2 gap-8">
          <QuestionForm
            question={question}
            errors={errors}
            slugWarning={slugWarning}
            showConstraintsGuide={showConstraintsGuide}
            scoreInput={scoreInput}
            onInputChange={handleInputChange}
            onScoreInputChange={handleScoreInputChange}
            onMakeSlugUnique={makeSlugUnique}
            onToggleConstraintsGuide={() => setShowConstraintsGuide(!showConstraintsGuide)}
            onAddTestcase={addTestcase}
            onMoveTestcase={moveTestcase}
            onDuplicateTestcase={duplicateTestcase}
            onRemoveTestcase={removeTestcase}
            onUpdateTestcase={updateTestcase}
            onSaveDraft={handleSaveDraft}
            onValidate={handleValidate}
            onPublishClick={handlePublishClick}
            lastAddedSampleId={lastAddedSampleId}
            lastAddedHiddenId={lastAddedHiddenId}
          />

          <div className="space-y-6">
            <LivePreview question={question} />
            <JsonPreview
              question={question}
              onCopy={copyToClipboard}
              onPreviewPublish={() => setShowPublishModal(true)}
            />
          </div>
        </div>
      </div>

      {showPublishModal && (
        <PublishModal
          question={question}
          onClose={() => setShowPublishModal(false)}
          onCopy={copyToClipboard}
          onConfirm={confirmPublish}
        />
      )}
    </div>
  )
}

export default GenerateContestQuestion
