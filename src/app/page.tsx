"use client"

import { useMemo } from "react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { ArrowRight, BarChart2, PiggyBank, Wallet, ZoomIn } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { EmptyState } from "@/components/empty-state"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useActivePlan } from "@/hooks/use-active-plan"
import { usePlanMetrics } from "@/hooks/use-plan-metrics"
import { useSettings } from "@/hooks/use-settings"
import { useBudgetStore } from "@/store/use-budget-store"
import { cn } from "@/lib/utils"

export default function DashboardPage() {
  const { plan } = useActivePlan()
  const { summary, realityCheck } = usePlanMetrics(plan)
  const { settings } = useSettings()
  const presets = useBudgetStore((state) => state.presets)

  const currency = plan?.currency || settings.currency
  const income = summary?.income ?? 0

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat(settings.locale, {
        style: "currency",
        currency,
      }),
    [currency, settings.locale]
  )

  const formatAmount = (value: number) => currencyFormatter.format(value)

  const preset = plan?.methodPresetId
    ? presets.find((item) => item.id === plan.methodPresetId)
    : undefined

  const methodLabel = (() => {
    if (!plan) return ""
    if (plan.methodMode === "preset") {
      return preset ? `${preset.name} preset` : "Preset budgeting"
    }
    if (plan.methodMode === "zero") {
      return "Zero-based budgeting"
    }
    return "Envelope allocations"
  })()

  if (!plan || !summary) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Dashboard"
          title="Build your first plan"
          description="Add income, categories, and goals to unlock personalised insights."
          actions={
            <Button asChild>
              <Link href="/plan">Open plan builder</Link>
            </Button>
          }
        />
        <EmptyState
          title="Nothing to analyse yet"
          description="Create a plan and start assigning money so the dashboard can monitor your progress."
          actions={
            <Button asChild variant="outline">
              <Link href="/plan">Create plan</Link>
            </Button>
          }
        />
      </div>
    )
  }

  const totalAllocated = summary.needs + summary.wants + summary.savings + summary.debt
  const leftoverPositive = summary.leftover >= 0
  const lastUpdated = plan.meta.updatedAt
    ? formatDistanceToNow(new Date(plan.meta.updatedAt), { addSuffix: true })
    : undefined

  const allocationBreakdown = [
    {
      key: "needs",
      label: "Needs",
      value: summary.needs,
      description: "Essentials and commitments",
      accent: "text-sky-600",
    },
    {
      key: "wants",
      label: "Wants",
      value: summary.wants,
      description: "Lifestyle and flexibility",
      accent: "text-violet-600",
    },
    {
      key: "savings",
      label: "Savings",
      value: summary.savings,
      description: "Goals and buffers",
      accent: "text-emerald-600",
    },
    {
      key: "debt",
      label: "Debt",
      value: summary.debt,
      description: "Minimum repayments",
      accent: "text-rose-600",
    },
  ] as const

  const planStats = [
    { label: "Categories", value: plan.categories.length },
    { label: "Debts", value: plan.debts.length },
    { label: "Savings goals", value: plan.goals.length },
  ]

  const formatPercent = (value: number) => {
    if (income <= 0) return 0
    return Math.round((value / income) * 100)
  }

  const clampProgress = (value: number) => {
    if (income <= 0) return 0
    return Math.min(Math.max((value / income) * 100, 0), 100)
  }

  const formatDelta = (value: number) => {
    const absolute = Math.abs(value)
    const prefix = value > 0 ? "+" : value < 0 ? "-" : ""
    if (absolute === 0) return "On target"
    return `${prefix}${currencyFormatter.format(absolute)}`
  }

  return (
    <div className="space-y-10 sm:space-y-12">
      <PageHeader
        eyebrow="Dashboard"
        title={plan.name}
        description="Monitor income, allocations, and leftover cash at a glance. Jump into detailed tools when something looks off."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link href="/plan">Open plan builder</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/methods">Adjust methods</Link>
            </Button>
          </div>
        }
        meta={
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="secondary">{methodLabel}</Badge>
            <span>Currency: {currency}</span>
            {lastUpdated ? <span>Updated {lastUpdated}</span> : null}
          </div>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Wallet className="h-4 w-4 text-muted-foreground" aria-hidden />
              Monthly income
            </CardTitle>
            <CardDescription>Normalised across all income sources.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold sm:text-3xl">{formatAmount(summary.income)}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {income > 0 ? `${formatPercent(totalAllocated)}% allocated so far` : "No income captured yet"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <BarChart2 className="h-4 w-4 text-muted-foreground" aria-hidden />
              Planned spending
            </CardTitle>
            <CardDescription>Needs, wants, savings, and debt combined.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold sm:text-3xl">{formatAmount(totalAllocated)}</p>
            <Progress value={income > 0 ? Math.min((totalAllocated / income) * 100, 100) : 0} className="mt-4 h-2" />
            <p className="mt-2 text-xs text-muted-foreground">
              {income > 0
                ? `${formatPercent(totalAllocated)}% of monthly income`
                : "Update income to see utilisation"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <PiggyBank className="h-4 w-4 text-muted-foreground" aria-hidden />
              Leftover cash
            </CardTitle>
            <CardDescription>What&apos;s unassigned after all commitments.</CardDescription>
          </CardHeader>
          <CardContent>
            <p
              className={cn(
                "text-2xl font-semibold sm:text-3xl",
                leftoverPositive ? "text-emerald-600" : "text-red-600"
              )}
            >
              {currencyFormatter.format(summary.leftover)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {leftoverPositive ? "Available to save or invest" : "Reduce allocations to eliminate the shortfall"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <ZoomIn className="h-4 w-4 text-muted-foreground" aria-hidden />
              Reality check
            </CardTitle>
            <CardDescription>
              Compare your allocations with the active method targets.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {realityCheck ? (
              <ul className="space-y-2">
                <li className="flex items-center justify-between">
                  <span className="text-muted-foreground">Needs</span>
                  <span>{formatDelta(realityCheck.needsDelta)}</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-muted-foreground">Wants</span>
                  <span>{formatDelta(realityCheck.wantsDelta)}</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-muted-foreground">Savings</span>
                  <span>{formatDelta(realityCheck.savingsDelta)}</span>
                </li>
              </ul>
            ) : (
              <p className="text-muted-foreground">
                Choose a preset method to see how your plan stacks up.
              </p>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Allocation breakdown</CardTitle>
            <CardDescription>Track what share of income supports each bucket.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {allocationBreakdown.map((item) => {
              const percent = formatPercent(item.value)
              return (
                <div key={item.key} className="space-y-2 rounded-xl border border-border/70 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className={cn("text-sm font-semibold", item.accent)}>{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{formatAmount(item.value)}</p>
                      <p className="text-xs text-muted-foreground">{percent}% of income</p>
                    </div>
                  </div>
                  <Progress value={clampProgress(item.value)} className="h-2" />
                </div>
              )
            })}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Plan snapshot</CardTitle>
            <CardDescription>Use these quick links to keep momentum.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2 text-sm text-muted-foreground">
              {planStats.map((stat) => (
                <li key={stat.label} className="flex items-center justify-between">
                  <span>{stat.label}</span>
                  <span className="font-semibold text-foreground">{stat.value}</span>
                </li>
              ))}
            </ul>
            <div className="space-y-2">
              <Button asChild variant="outline" className="w-full justify-between">
                <Link href="/plan">
                  Review categories
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-between">
                <Link href="/scenarios">
                  Compare scenarios
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-between">
                <Link href="/export">
                  Export plan data
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <Card className="transition hover:border-primary/40">
          <CardHeader>
            <CardTitle className="text-base">Fine-tune buckets</CardTitle>
            <CardDescription>Adjust presets or build a zero-based approach.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" size="sm">
              <Link href="/methods">Open methods</Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="transition hover:border-primary/40">
          <CardHeader>
            <CardTitle className="text-base">Re-balance allocations</CardTitle>
            <CardDescription>Shift money between categories after each month.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" size="sm">
              <Link href="/plan">Edit plan</Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="transition hover:border-primary/40">
          <CardHeader>
            <CardTitle className="text-base">Stress-test choices</CardTitle>
            <CardDescription>Model optimistic and fallback scenarios.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" size="sm">
              <Link href="/scenarios">Try scenarios</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
