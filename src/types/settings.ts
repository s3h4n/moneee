export interface SettingsState {
  activePlanId?: string
  currency: string
  locale: string
  theme: "light" | "dark" | "system"
  enablePasscode: boolean
  passcode?: string
  showRealityCheck: boolean
}
