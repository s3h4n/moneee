import type { MethodPreset } from "@/types"

export const DEFAULT_METHOD_PRESETS: MethodPreset[] = [
  {
    id: "50-30-20",
    name: "50 / 30 / 20",
    needsPct: 0.5,
    wantsPct: 0.3,
    savingsPct: 0.2,
  },
  {
    id: "60-30-10",
    name: "60 / 30 / 10",
    needsPct: 0.6,
    wantsPct: 0.3,
    savingsPct: 0.1,
  },
]

export function makeCustomPreset(
  name: string,
  needsPct: number,
  wantsPct: number,
  savingsPct: number
): MethodPreset {
  return {
    id: name.toLowerCase().replace(/\s+/g, "-"),
    name,
    needsPct,
    wantsPct,
    savingsPct,
  }
}
