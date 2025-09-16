"use client"

import { useMemo } from "react"
import { useBudgetStore } from "@/store/use-budget-store"
import type { Plan } from "@/types"

export function useActivePlan(): {
  plan?: Plan
  planId?: string
  setActivePlan: (planId: string) => void
} {
  const { activePlanId, plans, setActivePlan } = useBudgetStore((state) => ({
    activePlanId: state.settings.activePlanId,
    plans: state.plans,
    setActivePlan: state.setActivePlan,
  }))

  const plan = useMemo(() => {
    if (!activePlanId) return undefined
    return plans[activePlanId]
  }, [activePlanId, plans])

  return { plan, planId: activePlanId, setActivePlan }
}
