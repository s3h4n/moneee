"use client"

import { useBudgetStore } from "@/store/use-budget-store"

export function useMethodPresets() {
  return useBudgetStore((state) => ({
    presets: state.presets,
    addPreset: state.addPreset,
    updatePreset: state.updatePreset,
    removePreset: state.removePreset,
  }))
}
