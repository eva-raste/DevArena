import React from 'react'
import GenerateContestQuestion from './GenerateContestQuestion'
function CreateContest() {
  return (
    <GenerateContestQuestion
      demo={true}
      existingSlugs={["Two-Sum", "reverse-string"]}
      onSaveDraft={(q) => console.log("Draft saved:", q)}
      onPublish={(q) => console.log("Published:", q)}
    />
  )
}

export default CreateContest

