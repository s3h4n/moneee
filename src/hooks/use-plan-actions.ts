"use client"

import { useBudgetStore, type PlanSlice } from "@/store/use-budget-store"

type PlanActionHandlers = {
  updatePlan: (updater: Parameters<PlanSlice["updatePlan"]>[1]) => void
  upsertCategory: (category: Parameters<PlanSlice["upsertCategory"]>[1]) => void
  removeCategory: (categoryId: string) => void
  reorderCategories: (orderedIds: string[]) => void
  upsertDebt: (debt: Parameters<PlanSlice["upsertDebt"]>[1]) => void
  removeDebt: (debtId: string) => void
  upsertGoal: (goal: Parameters<PlanSlice["upsertGoal"]>[1]) => void
  removeGoal: (goalId: string) => void
  setMethodMode: (mode: Parameters<PlanSlice["setMethodMode"]>[1]) => void
  setMethodPreset: (presetId: string) => void
}

export function usePlanActions(planId?: string): Partial<PlanActionHandlers> {
  const actions = useBudgetStore((state) => ({
    updatePlan: state.updatePlan,
    upsertCategory: state.upsertCategory,
    removeCategory: state.removeCategory,
    reorderCategories: state.reorderCategories,
    upsertDebt: state.upsertDebt,
    removeDebt: state.removeDebt,
    upsertGoal: state.upsertGoal,
    removeGoal: state.removeGoal,
    setMethodMode: state.setMethodMode,
    setMethodPreset: state.setMethodPreset,
  }))

  if (!planId) {
    return {}
  }

  return {
    updatePlan: (updater: Parameters<typeof actions.updatePlan>[1]) =>
      actions.updatePlan(planId, updater),
    upsertCategory: (category: Parameters<typeof actions.upsertCategory>[1]) =>
      actions.upsertCategory(planId, category),
    removeCategory: (categoryId: string) => actions.removeCategory(planId, categoryId),
    reorderCategories: (orderedIds: string[]) =>
      actions.reorderCategories(planId, orderedIds),
    upsertDebt: (debt: Parameters<typeof actions.upsertDebt>[1]) =>
      actions.upsertDebt(planId, debt),
    removeDebt: (debtId: string) => actions.removeDebt(planId, debtId),
    upsertGoal: (goal: Parameters<typeof actions.upsertGoal>[1]) =>
      actions.upsertGoal(planId, goal),
    removeGoal: (goalId: string) => actions.removeGoal(planId, goalId),
    setMethodMode: (mode: Parameters<typeof actions.setMethodMode>[1]) =>
      actions.setMethodMode(planId, mode),
    setMethodPreset: (presetId: string) =>
      actions.setMethodPreset(planId, presetId),
  }
}
