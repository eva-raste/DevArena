import ContestForm from "./ContestForm"
import { useCreateContest } from "../../hooks/useCreateContest"

export default function CreateContestPage() {
  const { submit, loading, error, success } = useCreateContest()

  return (
    <ContestForm
      pageTitle="Create Contest"
      submitLabel="Create Contest"
      initialForm={{
        title: "",
        visibility: "PUBLIC",
        instructions: "",
        startTime: "",
        endTime: "",
      }}
      initialQuestions={[]}
      initialModifiers={[]}
      role="OWNER"
      loading={loading}
      error={error}
      success={success}
      onSubmit={submit}
    />
  )
}
