import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { verifyUserApi } from "../../apis/user-api"
import { removeModifierApi } from "../../apis/question-api"
export const ModifierManager = ({ modifiers = [], setModifiers, role = "OWNER" }) => {

  const {slug} = useParams()
  const isOwner = role?.toUpperCase() === "OWNER"
  const [email, setEmail] = useState("")
  const [error, setError] = useState(null)

  const handleVerify = async () => {
    if (!email) return

    try {
      setError(null)

      const user = await verifyUserApi(email)
      
      // prevent duplicate
      if (modifiers.includes(user.email)) {
        setError("User already added")
        return
      }

      // store ONLY email
      setModifiers(prev => [...prev, user.email])
      setEmail("")

    } catch (err) {
          const backendMessage =
            err.response?.data?.message

          if (backendMessage === "OWNER_CANNOT_BE_MODIFIER") {
            setError("You cannot add yourself as a modifier.")
          } else if (backendMessage === "User not found") {
            setError("User not found.")
          } else {
            setError("Verification failed.")
          }
        
    } 
  }

  const removeModifier = async (emailToRemove) => {
  try {
    await removeModifierApi(slug, emailToRemove)

    setModifiers(prev =>
      prev.filter(email => email !== emailToRemove)
    )

  } catch (e) {
    console.error("Failed to remove modifier", e)
    setError("Failed to remove modifier")
  }
}

  return (
    <div className="space-y-4">
      <label className="text-sm font-medium">
        Modifiers
      </label>

      {isOwner  && (
        <div className="flex gap-2">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter user email"
            className="border px-3 py-2 rounded"
          />
          <button
            onClick={handleVerify}
            className="px-4 py-2 bg-primary text-primary-foreground rounded"
          >
            Verify
          </button>
        </div>
      )}

      {error && (
        <p className="text-red-500 text-sm">
          {error}
        </p>
      )}
      {modifiers.length > 0 && (
        <div className="space-y-2">
          {modifiers.map(email => (
            <div
              key={email}
              className="flex justify-between items-center bg-muted p-2 rounded"
            >
              <span>{email}</span>

              {role === "OWNER" && (
                <button
                  onClick={() => removeModifier(email)}
                  className="text-red-500"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
