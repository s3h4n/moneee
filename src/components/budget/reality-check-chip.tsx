"use client"

import { Badge } from "@/components/ui/badge"
import { formatCurrency, type RealityCheck } from "@/lib/budget"

interface RealityCheckChipProps {
  realityCheck?: RealityCheck
  currency: string
  locale: string
}

function formatDelta(value: number, locale: string, currency: string) {
  const formatted = formatCurrency(Math.abs(value), locale, currency)
  return `${value >= 0 ? "+" : "-"}${formatted}`
}

export function RealityCheckChip({ realityCheck, currency, locale }: RealityCheckChipProps) {
  if (!realityCheck) return null

  const items = [
    { label: "Needs", value: realityCheck.needsDelta },
    { label: "Wants", value: realityCheck.wantsDelta },
    { label: "Savings", value: realityCheck.savingsDelta },
  ]

  return (
    <Badge
      variant="outline"
      className="flex flex-wrap gap-2 whitespace-pre-wrap bg-muted/50 px-3 py-2 text-xs font-normal"
    >
      <span className="font-semibold uppercase tracking-wide text-muted-foreground">
        Reality check
      </span>
      {items.map(({ label, value }) => (
        <span key={label} className="flex items-center gap-1">
          <span>{label}</span>
          <span className={value < 0 ? "text-destructive" : "text-emerald-600 dark:text-emerald-400"}>
            {formatDelta(value, locale, currency)}
          </span>
        </span>
      ))}
    </Badge>
  )
}
