"use client"

import Link from "next/link"
import { ChangeEvent } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useActivePlan } from "@/hooks/use-active-plan"
import { usePlanMetrics } from "@/hooks/use-plan-metrics"
import { usePlanActions } from "@/hooks/use-plan-actions"
import { PrintView } from "@/components/budget"
import { useSettings } from "@/hooks/use-settings"
import type { Plan } from "@/types"
import { toast } from "sonner"
import { resolveCategoryAmount } from "@/lib/budget"
import { PageHeader } from "@/components/page-header"
import { EmptyState } from "@/components/empty-state"

function downloadBlob(filename: string, data: string, type = "application/json") {
  const blob = new Blob([data], { type })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(url)
}

function planToCsv(plan: Plan) {
  const rows: string[] = []
  rows.push("Section,Name,Type,Bucket,Monthly")
  plan.categories.forEach((category) => {
    rows.push(
      [
        "Category",
        category.name,
        category.type,
        category.bucket,
        resolveCategoryAmount(category),
      ].join(",")
    )
  })
  rows.push("")
  rows.push("Section,Name,Balance,APR,Minimum")
  plan.debts.forEach((debt) => {
    rows.push(["Debt", debt.name, debt.balance, debt.apr, debt.minimum].join(","))
  })
  rows.push("")
  rows.push("Section,Name,Target,Current,Due")
  plan.goals.forEach((goal) => {
    rows.push(["Goal", goal.name, goal.target, goal.current, goal.dueDate ?? ""].join(","))
  })
  return rows.join("\n")
}

export default function ExportPage() {
  const { plan, planId } = useActivePlan()
  const { summary } = usePlanMetrics(plan)
  const { settings } = useSettings()
  const actions = usePlanActions(planId)
  const lastUpdated = plan.meta?.updatedAt
    ? new Date(plan.meta.updatedAt).toLocaleString(settings.locale, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : undefined

  if (!plan || !summary || !planId) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Export & import"
          description="Generate secure backups or print-ready views once your plan is in place."
          actions={
            <Button asChild>
              <Link href="/plan">Open plan builder</Link>
            </Button>
          }
        />
        <EmptyState
          title="There's nothing to export yet"
          description="Build a plan with categories, debts, and goals to enable JSON, CSV, and print exports."
        />
      </div>
    )
  }

  const handleExportJson = () => {
    downloadBlob(`${plan.name.replace(/\s+/g, "-")}.json`, JSON.stringify(plan, null, 2))
  }

  const handleExportCsv = () => {
    downloadBlob(`${plan.name.replace(/\s+/g, "-")}.csv`, planToCsv(plan), "text/csv")
  }

  const handleImport = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result)) as Plan
        actions.updatePlan?.(() => ({
          ...data,
          id: planId,
          meta: {
            ...plan.meta,
            ...data.meta,
            updatedAt: new Date().toISOString(),
            createdAt: plan.meta.createdAt,
          },
        }))
        toast.success("Plan imported")
      } catch {
        toast.error("Import failed. Check the JSON structure.")
      }
    }
    reader.readAsText(file)
    event.target.value = ""
  }

  return (
    <div className="space-y-8 sm:space-y-10">
      <PageHeader
        title="Export & import"
        description="Create secure backups, collaborate offline, or generate a polished printout of your current plan."
        eyebrow="Data control"
        actions={
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleExportJson}>Download JSON</Button>
            <Button variant="outline" onClick={handleExportCsv}>
              Download CSV
            </Button>
          </div>
        }
        meta={lastUpdated ? <span>Plan updated {lastUpdated}</span> : undefined}
      />

      <Card className="rounded-2xl border border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>Backup options</CardTitle>
          <CardDescription>Exports are processed locally and never leave your browser.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => window.print()}>
            Print / Save PDF
          </Button>
          <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium">
            <span className="rounded-full border border-dashed border-border/70 px-3 py-2 transition hover:border-primary/40">
              Import JSON
            </span>
            <input type="file" accept="application/json" className="hidden" onChange={handleImport} />
          </label>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border border-border/70 shadow-sm print:hidden">
        <CardHeader>
          <CardTitle>Print preview</CardTitle>
          <CardDescription>Ready for PDF or physical copies.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-hidden rounded-xl border border-dashed border-border/70">
          <PrintView plan={plan} locale={settings.locale} currency={plan.currency} />
        </CardContent>
      </Card>
    </div>
  )
}
