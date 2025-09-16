"use client"

import Link from "next/link"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useActivePlan } from "@/hooks/use-active-plan"
import { useScenarios } from "@/hooks/use-scenarios"
import { usePlanMetrics } from "@/hooks/use-plan-metrics"
import { usePlanActions } from "@/hooks/use-plan-actions"
import { calculatePlanSummary, formatCurrency } from "@/lib/budget"
import { useSettings } from "@/hooks/use-settings"
import { useBudgetStore } from "@/store/use-budget-store"
import type { Scenario } from "@/types"
import { toast } from "sonner"
import { PageHeader } from "@/components/page-header"
import { EmptyState } from "@/components/empty-state"
import { cn } from "@/lib/utils"

export default function ScenariosPage() {
  const { plan, planId } = useActivePlan()
  const { settings } = useSettings()
  const planMetrics = usePlanMetrics(plan)
  const { scenarios, deleteScenario, createScenario } = useScenarios()
  const [renaming, setRenaming] = useState<Record<string, string>>({})
  const actions = usePlanActions(planId)
  const updateScenario = useBudgetStore((state) => state.updateScenario)

  if (!plan || !planId) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Scenarios"
          description="Duplicate your base plan to test pay adjustments, new expenses, or payoff strategies."
          actions={
            <Button asChild>
              <Link href="/plan">Open plan builder</Link>
            </Button>
          }
        />
        <EmptyState
          title="Create a plan first"
          description="Scenarios piggyback on your active plan. Build one to start experimenting."
        />
      </div>
    )
  }

  const handleCreateScenario = () => {
    const id = createScenario(planId, `${plan.name} scenario`)
    if (id) {
      toast.success("Scenario saved")
    }
  }

  const baseSummary = planMetrics.summary

  const applyScenario = (scenario: Scenario) => {
    actions.updatePlan?.(() => ({
      ...scenario.plan,
      id: planId,
      meta: {
        ...scenario.plan.meta,
        updatedAt: new Date().toISOString(),
        createdAt: plan.meta.createdAt,
      },
    }))
    toast.success(`Applied ${scenario.name} to current plan`)
  }

  const renameScenario = (scenarioId: string) => {
    const name = renaming[scenarioId]?.trim()
    if (!name) return
    updateScenario(scenarioId, (scenario) => ({ ...scenario, name }))
    toast.success("Scenario renamed")
  }

  const syncFromPlan = (scenarioId: string) => {
    if (!plan) return
    updateScenario(scenarioId, (scenario) => ({
      ...scenario,
      plan: JSON.parse(JSON.stringify(plan)),
    }))
    toast.success("Scenario updated from current plan")
  }

  return (
    <div className="space-y-8 sm:space-y-10">
      <PageHeader
        title="Scenarios"
        description="Capture snapshots of your budget, adjust assumptions, and measure the deltas against your live plan."
        eyebrow="Plan sandboxes"
        actions={
          <Button size="sm" onClick={handleCreateScenario}>
            Duplicate current plan
          </Button>
        }
        meta={<span>{scenarios.length} saved scenario{scenarios.length === 1 ? "" : "s"}</span>}
      />

      {scenarios.length === 0 ? (
        <EmptyState
          title="No scenarios yet"
          description="Duplicate your plan to model pay cuts, new expenses, or payoff strategies without losing the original."
          actions={<Button onClick={handleCreateScenario}>Duplicate current plan</Button>}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {scenarios.map((scenario) => {
            const summary = calculatePlanSummary(scenario.plan)
            const deltas = baseSummary
              ? [
                  { label: "Income", value: summary.income - baseSummary.income },
                  { label: "Needs", value: summary.needs - baseSummary.needs },
                  { label: "Wants", value: summary.wants - baseSummary.wants },
                  {
                    label: "Savings / Debt",
                    value:
                      summary.savings + summary.debt - (baseSummary.savings + baseSummary.debt),
                  },
                  { label: "Leftover", value: summary.leftover - baseSummary.leftover },
                ]
              : []

            const updatedAt = new Date(scenario.updatedAt).toLocaleString(settings.locale, {
              dateStyle: "medium",
              timeStyle: "short",
            })

            return (
              <Card
                key={scenario.id}
                className="flex h-full flex-col gap-4 rounded-2xl border border-border/70 shadow-sm"
              >
                <CardHeader className="space-y-3">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-3">
                      <CardTitle className="text-base font-semibold">{scenario.name}</CardTitle>
                      <Badge variant="secondary" className="whitespace-nowrap">
                        Base: {plan.name}
                      </Badge>
                    </div>
                    <CardDescription>Updated {updatedAt}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-4 text-sm">
                  <div className="space-y-2">
                    {deltas.map((delta) => (
                      <div
                        key={delta.label}
                        className="flex items-center justify-between rounded-xl border border-transparent bg-muted/40 px-3 py-2 transition hover:border-muted-foreground/20"
                      >
                        <span>{delta.label}</span>
                        <span
                          className={cn(
                            "font-medium",
                            delta.value >= 0
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-destructive"
                          )}
                        >
                          {delta.value >= 0 ? "+" : "-"}
                          {formatCurrency(Math.abs(delta.value), settings.locale, plan.currency)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <Input
                      placeholder="Rename scenario"
                      value={renaming[scenario.id] ?? scenario.name}
                      onChange={(event) =>
                        setRenaming((prev) => ({ ...prev, [scenario.id]: event.target.value }))
                      }
                    />
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" onClick={() => renameScenario(scenario.id)}>
                        Save name
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => applyScenario(scenario)}>
                        Apply to plan
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => syncFromPlan(scenario.id)}>
                        Capture current plan
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteScenario(scenario.id)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
