/* eslint-disable no-unused-vars */
"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { fetchQuestionCard, updateQuestionApi } from "@/apis/question-api"
import { QuestionForm } from "./QuestionForm"

export default function EditQuestionForm() {
  const { slug } = useParams()
  const navigate = useNavigate()

  const [question, setQuestion] = useState({
  title: "",
  questionSlug: "",
  description: "",
  difficulty: null,
  score: null,
  constraints: "",
  sampleTestcases: [],
  hiddenTestcases: [],
})
  const [errors, setErrors] = useState([])
  const [slugWarning, setSlugWarning] = useState(false)
  const [showConstraintsGuide, setShowConstraintsGuide] = useState(false)
  const [scoreInput, setScoreInput] = useState("")
  const [lastAddedSampleId, setLastAddedSampleId] = useState(null)
  const [lastAddedHiddenId, setLastAddedHiddenId] = useState(null)
  const [loading, setLoading] = useState(true)

  /* ================== FETCH ================== */
  useEffect(() => {
    const load = async () => {
        // console.log("Calling api")
      const q = await fetchQuestionCard(slug)
        // console.log(q);
      setQuestion(q)
      setScoreInput(q.score?.toString() ?? "")
      setLoading(false)
    }

    load()
  }, [slug])

  const handleBackendError = (err) => {
    const status = err.response?.status
    const message = err.response?.data?.message

    if (
        status === 409 &&
        message === "QUESTION_SLUG_ALREADY_EXISTS"
    ) {
        setSlugWarning(true)
        setErrors(["Question slug already exists"])
        return
    }

    setErrors([message || "Something went wrong"])
    }


  /* ================== GENERIC FIELD UPDATE ================== */
  const onInputChange = useCallback((field, value) => {
    setQuestion((prev) => ({ ...prev, [field]: value }))

    if (field === "questionSlug") {
        setSlugWarning(false)
        setErrors((errs) =>
        errs.filter((e) => e !== "Question slug already exists")
        )
    }
    }, [])


  /* ================== SCORE ================== */
  const onScoreInputChange = (e) => {
    const value = e.target.value
    if (/^\d*$/.test(value)) {
      setScoreInput(value)
      setQuestion((prev) => ({
        ...prev,
        score: value === "" ? null : Number(value),
      }))
    }
  }

  /* ================== CONSTRAINTS GUIDE ================== */
  const onToggleConstraintsGuide = () =>
    setShowConstraintsGuide((v) => !v)

  /* ================== TESTCASES ================== */
  const onAddTestcase = (type) => {
    const id = crypto.randomUUID()

    setQuestion((prev) => ({
      ...prev,
      [type]: [
        ...(prev[type] ?? []),
        { id, input: "", output: "" },
      ],
    }))

    type === "sampleTestcases"
      ? setLastAddedSampleId(id)
      : setLastAddedHiddenId(id)
  }

  const onUpdateTestcase = (type, id, field, value) => {
        setQuestion((prev) => {
            const list = prev[type].map((tc) =>
            tc.id === id ? { ...tc, [field]: value } : tc
            )
            return { ...prev, [type]: list }
        })  
    }   


  const onRemoveTestcase = (type, id) => {
    setQuestion((prev) => ({
        ...prev,
        [type]: prev[type].filter((tc) => tc.id !== id),
    }))
    }   


  const onDuplicateTestcase = (type, testcase) => {
    setQuestion((prev) => {
        const index = prev[type].findIndex((tc) => tc.id === testcase.id)
        const copy = { ...testcase, id: crypto.randomUUID() }

        const list = [...prev[type]]
        list.splice(index + 1, 0, copy)

        return { ...prev, [type]: list }
    })
    }


    const onMoveTestcase = (type, index, direction) => {
        setQuestion((prev) => {
            const list = [...prev[type]]
            const target =
            direction === "up" ? index - 1 : index + 1

            if (target < 0 || target >= list.length) return prev

            ;[list[index], list[target]] = [list[target], list[index]]
            return { ...prev, [type]: list }
        })
    }


  /* ================== SAVE ================== */
  const onSaveDraft = async () => {
    // await updateQuestionApi(slug, question)
    // navigate("/show-all-questions")
  } 

  const onValidate = () => {
    const errs = []
    if (!question.title) errs.push("Title is required")
    if (!question.difficulty) errs.push("Difficulty is required")
    if (!question.score) errs.push("Score is required")

    setErrors(errs)
  }

  const onPublishClick = async () => {
    console.log(slug);
    onValidate()
    try {
        setErrors([])
        setSlugWarning(false)

        await updateQuestionApi(slug, question)
        navigate("/show-all-questions")
    } catch (err) {
        handleBackendError(err)
    }
  }

  if (loading || !question) return <div className="p-10">Loading...</div>

  return (
    <QuestionForm
      question={question}
      errors={errors}
      slugWarning={slugWarning}
      showConstraintsGuide={showConstraintsGuide}
      scoreInput={scoreInput}
      onInputChange={onInputChange}
      onScoreInputChange={onScoreInputChange}
      onMakeSlugUnique={() => {}}
      onToggleConstraintsGuide={onToggleConstraintsGuide}
      onAddTestcase={onAddTestcase}
      onMoveTestcase={onMoveTestcase}
      onDuplicateTestcase={onDuplicateTestcase}
      onRemoveTestcase={onRemoveTestcase}
      onUpdateTestcase={onUpdateTestcase}
      onSaveDraft={onSaveDraft}
      onValidate={onValidate}
      onPublishClick={onPublishClick}
      lastAddedSampleId={lastAddedSampleId}
      lastAddedHiddenId={lastAddedHiddenId}
    />
  )
}
