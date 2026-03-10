import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import ContestForm from "./ContestForm"
import { fetchContestByIdApi, updateContestApi } from "../../apis/contest-api"

export default function EditContestPage() {
  const { roomId } = useParams()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [initialForm, setInitialForm] = useState(null)
  const [initialQuestions, setInitialQuestions] = useState([])
  const [initialModifiers, setInitialModifiers] = useState([])
  const [role, setRole] = useState(null)
  const [modifiers, setModifiers] = useState([])

  useEffect(() => {
  if (!roomId) return

  const load = async () => {
    try {
      const contest = await fetchContestByIdApi(roomId)
      setInitialForm({
        title: contest.title,
        visibility: contest.visibility,
        instructions: contest.instructions ?? "",
        startTime: contest.startTime ?? "",
        endTime: contest.endTime ?? "",
      })
        console.log("Loaded contest for editing", contest)
      // backend already gives QuestionDto list
        setInitialQuestions(contest.questions ?? [])
        setInitialModifiers(contest.modifiers ?? [])
        setRole(contest.role)

    } catch (err) {
      console.error("Failed to load contest", err)
      setError("Failed to load contest")
    } finally {
      setLoading(false)
    }
  }

  load()
}, [roomId])


    const onSubmit = async (payload) => {
    try {
      const finalPayload = {
        ...payload
      }

      console.log("Submitting updated contest", finalPayload)

      await updateContestApi(roomId, finalPayload)

      setSuccess("Contest updated successfully")
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update contest")
    }
  }

  if (loading || !initialForm) {
    return <div className="p-6">Loading contest...</div>
  }

  return (
    <ContestForm
      pageTitle="Edit Contest"
      submitLabel="Update Contest"
      roomId={roomId}
      initialForm={initialForm}
      initialQuestions={initialQuestions}
      initialModifiers={initialModifiers}
      loading={loading}
      error={error}
      success={success}
      onSubmit={onSubmit}
      role={role}
    />
  )
}
