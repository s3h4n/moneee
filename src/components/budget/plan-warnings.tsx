"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import type { PlanWarning } from "@/lib/budget"
import { TriangleAlert } from "lucide-react"

interface PlanWarningsProps {
  warnings: PlanWarning[]
}

const TITLES: Record<PlanWarning["type"], string> = {
  overspend: "Overspending",
  "negative-leftover": "Negative leftover",
  "underfunded-goals": "Underfunded goals",
}

export function PlanWarnings({ warnings }: PlanWarningsProps) {
  if (warnings.length === 0) return null

  return (
    <div className="space-y-2">
      {warnings.map((warning) => (
        <Alert key={warning.type} variant="destructive">
          <TriangleAlert className="h-4 w-4" />
          <AlertTitle>{TITLES[warning.type]}</AlertTitle>
          <AlertDescription>{warning.message}</AlertDescription>
        </Alert>
      ))}
    </div>
  )
}
