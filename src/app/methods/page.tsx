"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MethodSliderGroup } from "@/components/budget"
import { useActivePlan } from "@/hooks/use-active-plan"
import { usePlanMetrics } from "@/hooks/use-plan-metrics"
import { useMethodPresets } from "@/hooks/use-method-presets"
import { usePlanActions } from "@/hooks/use-plan-actions"
import { useSettings } from "@/hooks/use-settings"
import type { MethodPreset } from "@/types"
import { createId } from "@/lib/id"
import { PageHeader } from "@/components/page-header"
import { EmptyState } from "@/components/empty-state"
import { cn } from "@/lib/utils"

export default function MethodsPage() {
  const { plan, planId } = useActivePlan()
  const { summary } = usePlanMetrics(plan)
  const { settings } = useSettings()
  const { presets, addPreset, updatePreset } = useMethodPresets()
  const planActions = usePlanActions(planId)
  const [selectedId, setSelectedId] = useState<string | undefined>(plan?.methodPresetId ?? presets[0]?.id)
  const selectedPreset = useMemo(
    () => presets.find((preset) => preset.id === selectedId) ?? presets[0],
    [presets, selectedId]
  )
  const [draft, setDraft] = useState<MethodPreset | undefined>(selectedPreset)
  const [draftName, setDraftName] = useState(selectedPreset?.name ?? "")

  useEffect(() => {
    if (selectedPreset) {
      setDraft({ ...selectedPreset })
      setDraftName(selectedPreset.name)
    }
  }, [selectedPreset])

  if (!plan || !draft || !summary) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Budget methods"
          description="Pick a preset or tweak the sliders once you have income and categories in place."
          actions={
            <Button asChild>
              <Link href="/plan">Go to plan builder</Link>
            </Button>
          }
        />
        <EmptyState
          title="Set up your first plan"
          description="Add income, categories, and goals to unlock live guidance and personalised rules."
          actions={
            <Button asChild variant="outline">
              <Link href="/plan">Open plan builder</Link>
            </Button>
          }
        />
      </div>
    )
  }

  const handleApply = () => {
    if (!planId || !planActions.setMethodMode || !planActions.setMethodPreset || !draft) return
    planActions.setMethodMode("preset")
    planActions.setMethodPreset(draft.id)
    toast.success(`Applied ${draft.name} to ${plan.name}`)
  }

  const handleSaveCustom = () => {
    if (!draft || !draftName.trim()) {
      toast.error("Give your preset a friendly name")
      return
    }
    const id = createId("preset")
    const preset: MethodPreset = {
      ...draft,
      id,
      name: draftName.trim(),
    }
    addPreset(preset)
    setSelectedId(preset.id)
    toast.success("Preset saved")
  }

  const handleUpdatePreset = () => {
    if (!draft || !draftName.trim()) {
      toast.error("Preset name cannot be empty")
      return
    }
    updatePreset({ ...draft, name: draftName.trim() })
    toast.success("Preset updated")
  }

  return (
    <div className="space-y-8 sm:space-y-10">
      <PageHeader
        title="Budget methods"
        description="Balance needs, wants, and savings with presets tuned to your income. Save and reuse any rule that works for you."
        eyebrow="Method presets"
        actions={
          <Button asChild variant="outline">
            <Link href="/plan">Adjust plan inputs</Link>
          </Button>
        }
        meta={
          <span>
            Applying a preset keeps live totals in sync with your current allocations.
          </span>
        }
      />

      <section className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Card className="h-full">
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Tune your rule</CardTitle>
              <CardDescription>Drag the sliders or type percentages to adjust each bucket.</CardDescription>
            </div>
            <Badge variant="outline" className="w-fit">
              Monthly income {new Intl.NumberFormat(settings.locale, { style: "currency", currency: plan.currency }).format(summary.income)}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-6">
            <MethodSliderGroup
              preset={draft}
              income={summary.income}
              locale={settings.locale}
              currency={plan.currency}
              allocations={{ needs: summary.needs, wants: summary.wants, savings: summary.savings }}
              onChange={setDraft}
            />
            <div className="grid gap-4 sm:grid-cols-[1.3fr_auto]">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground" htmlFor="preset-name">
                  Preset name
                </label>
                <Input
                  id="preset-name"
                  value={draftName}
                  onChange={(event) => setDraftName(event.target.value)}
                  placeholder="e.g. Essentials-first"
                />
              </div>
              <div className="flex flex-wrap items-center justify-end gap-2">
                <Button onClick={handleApply} className="flex-1 sm:flex-none">
                  Apply to plan
                </Button>
                <Button variant="outline" onClick={handleUpdatePreset}>
                  Update preset
                </Button>
              </div>
            </div>
            <Button variant="ghost" className="w-full" onClick={handleSaveCustom}>
              Save as new preset
            </Button>
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader>
            <CardTitle>Guideline presets</CardTitle>
            <CardDescription>Compare rules and switch instantly to explore trade-offs.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {presets.length === 0 ? (
              <EmptyState
                title="No presets available"
                description="Save a preset after tuning the sliders to reuse it in future plans."
                className="py-10"
                actions={<Button onClick={handleSaveCustom}>Save current as preset</Button>}
              />
            ) : (
              <ScrollArea className="max-h-[420px] pr-2">
                <div className="space-y-2">
                  {presets.map((preset) => {
                    const isSelected = selectedId === preset.id
                    const isApplied = plan.methodPresetId === preset.id
                    return (
                      <button
                        type="button"
                        key={preset.id}
                        onClick={() => setSelectedId(preset.id)}
                        className={cn(
                          "w-full rounded-2xl border px-4 py-3 text-left transition",
                          isSelected
                            ? "border-primary bg-primary/5 shadow-sm"
                            : "border-border/70 hover:border-primary/40 hover:bg-muted/60"
                        )}
                        aria-pressed={isSelected}
                      >
                        <div className="flex items-center justify-between gap-2 text-sm font-medium">
                          <span>{preset.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {Math.round(preset.needsPct * 100)} / {Math.round(preset.wantsPct * 100)} / {Math.round(preset.savingsPct * 100)}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">Needs / Wants / Savings</p>
                        {isApplied ? (
                          <Badge variant="secondary" className="mt-2">
                            Applied to plan
                          </Badge>
                        ) : null}
                      </button>
                    )
                  })}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold sm:text-xl">Next steps</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="transition hover:border-primary/40">
            <CardHeader>
              <CardTitle className="text-base">Build the plan</CardTitle>
              <CardDescription>Set up income streams, categories, and goals.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" size="sm">
                <Link href="/plan">Open builder</Link>
              </Button>
            </CardContent>
          </Card>
          <Card className="transition hover:border-primary/40">
            <CardHeader>
              <CardTitle className="text-base">Compare scenarios</CardTitle>
              <CardDescription>Duplicate your plan, tweak, and see the differences.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" size="sm">
                <Link href="/scenarios">View scenarios</Link>
              </Button>
            </CardContent>
          </Card>
          <Card className="transition hover:border-primary/40">
            <CardHeader>
              <CardTitle className="text-base">Export or print</CardTitle>
              <CardDescription>Keep an offline copy or share collaborative views.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" size="sm">
                <Link href="/export">Export data</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
