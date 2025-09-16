"use client"

import { useMemo } from "react"
import { calculatePlanSummary, computeRealityCheck, evaluatePlanWarnings } from "@/lib/budget"
import { useBudgetStore } from "@/store/use-budget-store"
import type { Plan } from "@/types"

export function usePlanMetrics(plan?: Plan) {
  const preset = useBudgetStore((state) =>
    plan?.methodPresetId
      ? state.presets.find((item) => item.id === plan.methodPresetId)
      : undefined
  )

  const summary = useMemo(() => (plan ? calculatePlanSummary(plan) : undefined), [plan])
  const warnings = useMemo(() => (plan ? evaluatePlanWarnings(plan) : []), [plan])
  const realityCheck = useMemo(() => {
    if (!plan || !summary || !preset) return undefined
    return computeRealityCheck(summary.income, summary, preset)
  }, [plan, summary, preset])

  return {
    summary,
    warnings,
    realityCheck,
  }
}
