"use client"

import { useMemo } from "react"
import { useBudgetStore } from "@/store/use-budget-store"

export function useScenarios() {
  const { scenarios, deleteScenario, createScenario } = useBudgetStore((state) => ({
    scenarios: state.scenarios,
    deleteScenario: state.deleteScenario,
    createScenario: state.createScenario,
  }))

  const list = useMemo(() => Object.values(scenarios), [scenarios])

  return {
    scenarios: list,
    deleteScenario,
    createScenario,
  }
}
