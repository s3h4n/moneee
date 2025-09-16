"use client"

import { useCallback, useMemo } from "react"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { percentTargets, formatCurrency } from "@/lib/budget"
import type { MethodPreset } from "@/types"
import { cn } from "@/lib/utils"

interface MethodSliderGroupProps {
  preset: MethodPreset
  income: number
  locale: string
  currency: string
  allocations?: { needs: number; wants: number; savings: number }
  onChange?: (preset: MethodPreset) => void
  disabled?: boolean
}

type BucketKey = "needs" | "wants" | "savings"

const LABELS: Record<BucketKey, string> = {
  needs: "Needs",
  wants: "Wants",
  savings: "Savings",
}

function normalisePreset(target: MethodPreset, key: keyof MethodPreset, value: number) {
  const next: MethodPreset = { ...target }
  const bucketKey = key as keyof MethodPreset
  if (bucketKey === "needsPct" || bucketKey === "wantsPct" || bucketKey === "savingsPct") {
    const buckets: Record<BucketKey, number> = {
      needs: next.needsPct,
      wants: next.wantsPct,
      savings: next.savingsPct,
    }
    const bucket = bucketKey.replace("Pct", "") as BucketKey
    const newValue = Math.min(Math.max(value, 0), 1)
    buckets[bucket] = newValue

    const otherKeys = (Object.keys(buckets) as BucketKey[]).filter((item) => item !== bucket)
    const currentOthers = otherKeys.reduce((total, item) => total + buckets[item], 0)
    const remaining = Math.max(1 - newValue, 0)
    if (currentOthers === 0) {
      const share = remaining / otherKeys.length
      otherKeys.forEach((item) => {
        buckets[item] = share
      })
    } else {
      const scale = remaining / currentOthers
      otherKeys.forEach((item) => {
        buckets[item] = buckets[item] * scale
      })
    }

    next.needsPct = Number(buckets.needs.toFixed(4))
    next.wantsPct = Number(buckets.wants.toFixed(4))
    next.savingsPct = Number(buckets.savings.toFixed(4))
  }
  return next
}

export function MethodSliderGroup({
  preset,
  income,
  locale,
  currency,
  allocations,
  onChange,
  disabled,
}: MethodSliderGroupProps) {
  const targets = useMemo(() => percentTargets(income, preset), [income, preset])

  const handleSlider = useCallback(
    (bucket: BucketKey, percentValue: number[]) => {
      if (!onChange) return
      const value = (percentValue[0] ?? 0) / 100
      const updated = normalisePreset(preset, `${bucket}Pct` as keyof MethodPreset, value)
      onChange(updated)
    },
    [onChange, preset]
  )

  const handleInput = useCallback(
    (bucket: BucketKey, value: string) => {
      if (!onChange) return
      const numeric = Number(value) / 100
      if (Number.isNaN(numeric)) return
      const updated = normalisePreset(preset, `${bucket}Pct` as keyof MethodPreset, numeric)
      onChange(updated)
    },
    [onChange, preset]
  )

  const bucketValues: Record<BucketKey, number> = {
    needs: preset.needsPct,
    wants: preset.wantsPct,
    savings: preset.savingsPct,
  }

  return (
    <div className="grid gap-4">
      {(Object.keys(bucketValues) as BucketKey[]).map((bucket) => {
        const percentValue = Math.round(bucketValues[bucket] * 100)
        const targetAmount = targets[bucket]
        const actual = allocations?.[bucket] ?? 0
        const delta = actual - targetAmount
        const showDelta = allocations !== undefined
        const isPositive = delta >= 0

        return (
          <div
            key={bucket}
            className="group rounded-2xl border border-border/70 bg-card/70 p-4 shadow-sm backdrop-blur transition hover:border-primary/50 focus-within:border-primary"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold sm:text-base">{LABELS[bucket]}</p>
                <p className="text-xs text-muted-foreground sm:text-sm" id={`${bucket}-hint`}>
                  Target {percentValue}% • {formatCurrency(targetAmount, locale, currency)}
                </p>
              </div>
              {showDelta ? (
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
                    isPositive
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
                      : "bg-destructive/10 text-destructive"
                  )}
                >
                  {isPositive ? "Ahead" : "Behind"} {formatCurrency(Math.abs(delta), locale, currency)}
                </span>
              ) : null}
            </div>
            <div className="mt-4 space-y-3">
              <Slider
                value={[percentValue]}
                min={0}
                max={100}
                step={1}
                disabled={disabled}
                aria-describedby={`${bucket}-hint`}
                aria-label={`${LABELS[bucket]} percentage`}
                onValueChange={(value) => handleSlider(bucket, value)}
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <label className="sr-only" htmlFor={`${bucket}-percent`}>
                    {LABELS[bucket]} percentage
                  </label>
                  <Input
                    id={`${bucket}-percent`}
                    type="number"
                    className="h-8 w-20"
                    min={0}
                    max={100}
                    step={1}
                    value={percentValue}
                    disabled={disabled}
                    onChange={(event) => handleInput(bucket, event.target.value)}
                  />
                  <span className="text-muted-foreground">%</span>
                </div>
                {showDelta ? (
                  <span
                    className={cn(
                      "font-medium",
                      isPositive
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-destructive"
                    )}
                  >
                    Actual {formatCurrency(actual, locale, currency)}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
