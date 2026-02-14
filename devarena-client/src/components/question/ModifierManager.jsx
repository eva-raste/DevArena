"use client"

import React, { useState } from "react"
import { verifyUserByEmail } from "@/apis/question-api"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X } from "lucide-react"

export const ModifierManager = ({ modifiers, setModifiers }) => {

    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const handleVerify = async () => {
        if (!email) return

        try {
            setLoading(true)
            setError(null)

            const user = await verifyUserByEmail(email)

            // prevent duplicate
            if (modifiers.some(m => m.userId === user.userId)) {
                setError("User already added")
                return
            }

            setModifiers(prev => [
              ...prev,
              {
                userId: user.userId,
                email: user.email,
                displayName: user.displayName
              }
            ]);
            setEmail("")
        } catch (e) {
            setError("User not found")
        } finally {
            setLoading(false)
        }
    }

    const removeModifier = (userId) => {
        setModifiers(prev => prev.filter(m => m.userId !== userId))
    }

    return (
        <div className="space-y-6">

            <div className="flex gap-3">
                <Input
                    placeholder="Enter user email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <Button onClick={handleVerify} disabled={loading}>
                    {loading ? "Verifying..." : "Verify"}
                </Button>
            </div>

            {error && (
                <p className="text-sm text-red-500">{error}</p>
            )}

            <div className="space-y-2">
                {modifiers.map(user => (
                    <div
                        key={user.userId}
                        className="flex items-center justify-between bg-muted p-3 rounded-xl"
                    >
                        <div>
                            <p className="font-medium">{user.username}</p>
                            <p className="text-xs text-muted-foreground">
                                {user.email}
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <Badge variant="secondary">
                                Modifier
                            </Badge>

                            <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => removeModifier(user.userId)}
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

        </div>
    )
}
