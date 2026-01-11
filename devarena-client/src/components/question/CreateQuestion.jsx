/* eslint-disable no-unused-vars */
"use client"

import { useState, useEffect, useCallback } from "react"
import { generateUUID, slugify, validateQuestion } from "../../apis/question-utils"
import { createQuestion } from "../../apis/question-api"
import { QuestionForm } from "./QuestionForm"
import { LivePreview } from "./LivePreview"
import { JsonPreview } from "./JsonPreview"
import { PublishModal } from "./PublishModal"
import { CodeforcesPrefill } from "./CodeforcesPrefill"
import { AppToast } from "./AppToast"
import styles from "./css/CreateQuestion.module.css"
import { useNavigate } from "react-router-dom"

const CreateQuestion = ({ existingSlugs = [] }) => {
  const emptyState = {
    questionId: generateUUID(),
    questionSlug: "",
    title: "",
    description: "",
    difficulty: "",
    score: 0,
    constraints: "",
    sampleTestcases: [],
    hiddenTestcases: [],
  }

  const navigate = useNavigate()

  const [question, setQuestion] = useState({ ...emptyState })
  const [errors, setErrors] = useState([])
  const [toast, setToast] = useState(null)
  const [showPublishModal, setShowPublishModal] = useState(false)
  const [slugWarning, setSlugWarning] = useState(false)
  const [lastAddedSampleId, setLastAddedSampleId] = useState(null)
  const [lastAddedHiddenId, setLastAddedHiddenId] = useState(null)
  const [scoreInput, setScoreInput] = useState("")

  /* auto-generate slug */
  useEffect(() => {
    if (!question.title || question.questionSlug) return
    setQuestion(prev => ({
      ...prev,
      questionSlug: slugify(question.title),
    }))
  }, [question.title])

  /* slug conflict */
  useEffect(() => {
    setSlugWarning(
      question.questionSlug &&
      existingSlugs.includes(question.questionSlug)
    )
  }, [question.questionSlug, existingSlugs])

  const showToast = useCallback((message, type = "info") => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 2500)
  }, [])

  const handleInputChange = useCallback((field, value) => {
    setQuestion(prev => ({ ...prev, [field]: value }))
  }, [])

  const handleScoreInputChange = useCallback((e) => {
    const v = e.target.value
    if (v === "" || /^\d+$/.test(v)) {
      setScoreInput(v)
      setQuestion(prev => ({
        ...prev,
        score: v === "" ? 0 : Number(v),
      }))
    }
  }, [])

  /* ---------------- TESTCASE LOGIC ---------------- */

  const createEmptyTestcase = () => ({
    id: generateUUID(),
    input: "",
    output: "",
    explanation: "",
  })

  const handleAddTestcase = useCallback((type) => {
    const tc = createEmptyTestcase()

    setQuestion(prev => ({
      ...prev,
      [type]: [...prev[type], tc],
    }))

    type === "sampleTestcases"
      ? setLastAddedSampleId(tc.id)
      : setLastAddedHiddenId(tc.id)
  }, [])

  const handleUpdateTestcase = useCallback((type, id, field, value) => {
    setQuestion(prev => ({
      ...prev,
      [type]: prev[type].map(tc =>
        tc.id === id ? { ...tc, [field]: value } : tc
      ),
    }))
  }, [])

  const handleRemoveTestcase = useCallback((type, id) => {
    setQuestion(prev => ({
      ...prev,
      [type]: prev[type].filter(tc => tc.id !== id),
    }))
  }, [])

  const handleDuplicateTestcase = useCallback((type, id) => {
    setQuestion(prev => {
      const idx = prev[type].findIndex(tc => tc.id === id)
      if (idx === -1) return prev

      const clone = { ...prev[type][idx], id: generateUUID() }
      const updated = [...prev[type]]
      updated.splice(idx + 1, 0, clone)

      return { ...prev, [type]: updated }
    })
  }, [])

  const handleMoveTestcase = useCallback((type, from, to) => {
    setQuestion(prev => {
      if (to < 0 || to >= prev[type].length) return prev
      const updated = [...prev[type]]
      const [item] = updated.splice(from, 1)
      updated.splice(to, 0, item)
      return { ...prev, [type]: updated }
    })
  }, [])

  /* ---------------- VALIDATION / PUBLISH ---------------- */

  const handleValidate = useCallback(() => {
    const errs = validateQuestion(question)
    setErrors(errs)
    errs.length === 0
      ? showToast("Validation passed", "success")
      : showToast(`${errs.length} error(s) found`, "error")
  }, [question, showToast])

  const handlePublishClick = useCallback(() => {
    const errs = validateQuestion(question)
    if (errs.length) {
      setErrors(errs)
      showToast("Fix validation errors first", "error")
      return
    }
    setShowPublishModal(true)
  }, [question, showToast])

  const confirmPublish = useCallback(async () => {
    try {
      await createQuestion(question)
      showToast("Question created", "success")
      setQuestion({ ...emptyState })
      setScoreInput("")
      navigate("/show-all-questions")
    } catch (e) {
      showToast("Publish failed", "error")
    }
  }, [question, navigate, showToast])

  return (
    <div className={`${styles.pageContainer} p-6 text-gray-100`}>
      <AppToast toast={toast} />

      <CodeforcesPrefill
        onPrefillSuccess={(prefill) => {
          setQuestion(prev => ({ ...prev, ...prefill }))
          showToast("Imported from Codeforces", "success")
        }}
      />


      <QuestionForm
        question={question}
        errors={errors}
        slugWarning={slugWarning}
        scoreInput={scoreInput}

        onInputChange={handleInputChange}
        onScoreInputChange={handleScoreInputChange}
        onValidate={handleValidate}
        onPublishClick={handlePublishClick}

        onAddTestcase={handleAddTestcase}
        onUpdateTestcase={handleUpdateTestcase}
        onRemoveTestcase={handleRemoveTestcase}
        onDuplicateTestcase={handleDuplicateTestcase}
        onMoveTestcase={handleMoveTestcase}

        lastAddedSampleId={lastAddedSampleId}
        lastAddedHiddenId={lastAddedHiddenId}
      />

      {showPublishModal && (
        <PublishModal
          question={question}
          onClose={() => setShowPublishModal(false)}
          onConfirm={confirmPublish}
        />
      )}

      <div className={styles.gridContainer}>
        <LivePreview question={question} />
        <JsonPreview question={question} />
      </div>
    </div>
  )
}

export default CreateQuestion