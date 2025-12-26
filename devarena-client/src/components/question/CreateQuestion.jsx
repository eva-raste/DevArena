"use client"

import { useState, useEffect, useCallback } from "react"
import { generateUUID, slugify, validateQuestion } from "../../apis/question-utils"
import { createQuestion } from "../../apis/question-api"
import { Toast } from "./Toast"
import { QuestionForm } from "./QuestionForm"
import { LivePreview } from "./LivePreview"
import { JsonPreview } from "./JsonPreview"
import { PublishModal } from "./PublishModal"
import styles from './css/CreateQuestion.module.css';
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

  const navigate = useNavigate();

  const [question, setQuestion] = useState({ ...emptyState })
  const [errors, setErrors] = useState([])
  const [toast, setToast] = useState(null)
  const [showPublishModal, setShowPublishModal] = useState(false)
  const [slugWarning, setSlugWarning] = useState(false)
  const [lastAddedSampleId, setLastAddedSampleId] = useState(null)
  const [lastAddedHiddenId, setLastAddedHiddenId] = useState(null)
  const [scoreInput, setScoreInput] = useState("")
  // eslint-disable-next-line no-unused-vars
  const [isPublishing, setIsPublishing] = useState(false)


  /* Slug auto-generate */
  useEffect(() => {
    if (!question.title) return
    setQuestion(prev => ({
      ...prev,
      questionSlug: slugify(question.title),
    }))
  }, [question.title])

  /* Slug conflict */
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
    const value = e.target.value
    if (value === "" || /^\d+$/.test(value)) {
      setScoreInput(value)
      setQuestion(prev => ({
        ...prev,
        score: value === "" ? 0 : Number(value),
      }))
    }
  }, [])

  const makeSlugUnique = useCallback(() => {
    const base = question.questionSlug || "question"
    let counter = 1
    let slug = `${base}-${counter}`

    while (existingSlugs.includes(slug)) {
      counter++
      slug = `${base}-${counter}`
    }

    setQuestion(prev => ({ ...prev, questionSlug: slug }))
    showToast("Slug made unique", "success")
  }, [question.questionSlug, existingSlugs, showToast])

  const addTestcase = useCallback((type) => {
    const tc = { id: generateUUID(), input: "", output: "" }

    setQuestion(prev => ({
      ...prev,
      [type]: [...prev[type], tc],
    }))

    type === "sampleTestcases"
      ? setLastAddedSampleId(tc.id)
      : setLastAddedHiddenId(tc.id)
  }, [])

  const updateTestcase = useCallback((type, id, field, value) => {
    setQuestion(prev => ({
      ...prev,
      [type]: prev[type].map(tc =>
        tc.id === id ? { ...tc, [field]: value } : tc
      ),
    }))
  }, [])

  const removeTestcase = useCallback((type, id) => {
    setQuestion(prev => ({
      ...prev,
      [type]: prev[type].filter(tc => tc.id !== id),
    }))
  }, [])

  const handleValidate = useCallback(() => {
    const errs = validateQuestion(question)
    setErrors(errs)
    errs.length === 0
      ? showToast("Validation passed", "success")
      : showToast(`${errs.length} error(s) found`, "error")
  }, [question, showToast])

  const handlePublishClick = useCallback(() => {
    const errs = validateQuestion(question)
    if (errs.length > 0) {
      setErrors(errs)
      showToast("Fix validation errors first", "error")
      return
    }
    setShowPublishModal(true)
  }, [question, showToast])

const confirmPublish = useCallback(async () => {
  setIsPublishing(true)          // start loader
  setShowPublishModal(false)     // close modal immediately

  try {
    await createQuestion(question)

    showToast("Question created", "success")
    setQuestion({ ...emptyState })
    setScoreInput("")
    navigate("/show-all-questions")
  } catch (err) {
    showToast(err.message || "Publish failed", "error")
  } finally {
    setIsPublishing(false)       // stop loader
  }
}, [question, showToast])


  return (
    <div className={`${styles.pageContainer} text-gray-100 p-6`}>
    <div className={styles.contentWrapper}>
      <Toast toast={toast} />

      <QuestionForm
        question={question}
        errors={errors}
        slugWarning={slugWarning}
        scoreInput={scoreInput}
        onInputChange={handleInputChange}
        onScoreInputChange={handleScoreInputChange}
        onMakeSlugUnique={makeSlugUnique}
        onAddTestcase={addTestcase}
        onRemoveTestcase={removeTestcase}
        onUpdateTestcase={updateTestcase}
        onValidate={handleValidate}
        onPublishClick={handlePublishClick}
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
        <div className={`${styles.previewCard} rounded-2xl p-6`}>
          <LivePreview question={question} />
        </div>
        <div className={`${styles.previewCard} rounded-2xl p-6`}>
          <JsonPreview question={question} />
        </div>
      </div>
    </div>
    </div>
  )
}

export default CreateQuestion
