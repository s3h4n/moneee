"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface PasscodeGateProps {
  enabled: boolean
  passcode?: string
  children: React.ReactNode
}

const STORAGE_KEY = "moneee-passcode-cache"

export function PasscodeGate({ enabled, passcode, children }: PasscodeGateProps) {
  const [unlocked, setUnlocked] = useState(!enabled || !passcode)
  const [attempt, setAttempt] = useState("")
  const [error, setError] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (!enabled || !passcode) {
      setUnlocked(true)
      return
    }
    const cached = localStorage.getItem(STORAGE_KEY)
    if (cached && cached === passcode) {
      setUnlocked(true)
    } else {
      setUnlocked(false)
    }
  }, [enabled, passcode])

  const handleUnlock = () => {
    if (!passcode) {
      setUnlocked(true)
      return
    }
    if (attempt === passcode) {
      localStorage.setItem(STORAGE_KEY, passcode)
      setUnlocked(true)
      setAttempt("")
      setError(undefined)
    } else {
      setError("Incorrect passcode")
    }
  }

  if (!enabled || !passcode || unlocked) {
    return <>{children}</>
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="w-full max-w-sm space-y-4 rounded-lg border bg-card p-6 text-center shadow-sm">
        <h2 className="text-lg font-semibold">Enter passcode</h2>
        <p className="text-sm text-muted-foreground">
          This budget is locked on this device. Enter the passcode you set to continue.
        </p>
        <Input
          type="password"
          value={attempt}
          onChange={(event) => {
            setAttempt(event.target.value)
            setError(undefined)
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              handleUnlock()
            }
          }}
          placeholder="••••"
          aria-label="Passcode"
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button className="w-full" onClick={handleUnlock}>
          Unlock
        </Button>
      </div>
    </div>
  )
}
