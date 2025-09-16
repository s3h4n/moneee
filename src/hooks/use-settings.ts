"use client"

import { useBudgetStore } from "@/store/use-budget-store"

export function useSettings() {
  return useBudgetStore((state) => ({
    settings: state.settings,
    setSettings: state.setSettings,
    setPasscode: state.setPasscode,
    deleteAllData: state.deleteAllData,
  }))
}
