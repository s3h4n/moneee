"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  CategoryList,
  CategoryFormDialog,
  DebtFormDialog,
  GoalFormDialog,
  DebtWhatIf,
  EnvelopeGrid,
  LocaleCurrencyPicker,
  SinkingFundRow,
} from "@/components/budget"
import { useActivePlan } from "@/hooks/use-active-plan"
import { usePlanActions } from "@/hooks/use-plan-actions"
import { usePlanMetrics } from "@/hooks/use-plan-metrics"
import { useSettings } from "@/hooks/use-settings"
import type { Category, Debt, Goal, IncomeInput, Plan, SinkingFund } from "@/types"
import { Table, TableBody } from "@/components/ui/table"
import { toast } from "sonner"
import { formatCurrency } from "@/lib/budget"
import { PageHeader } from "@/components/page-header"
import { EmptyState } from "@/components/empty-state"
import { cn } from "@/lib/utils"

const FREQUENCIES = [
  { value: "monthly", label: "Monthly" },
  { value: "bi-weekly", label: "Bi-weekly" },
  { value: "weekly", label: "Weekly" },
] as const

export default function PlanBuilderPage() {
  const { plan, planId } = useActivePlan()
  const { summary } = usePlanMetrics(plan)
  const { settings, setSettings, setPasscode } = useSettings()
  const actions = usePlanActions(planId)
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | undefined>(undefined)
  const [debtDialogOpen, setDebtDialogOpen] = useState(false)
  const [editingDebt, setEditingDebt] = useState<Debt | undefined>(undefined)
  const [goalDialogOpen, setGoalDialogOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | undefined>(undefined)
  const [passcodeDraft, setPasscodeDraft] = useState(settings.passcode ?? "")

  const PASSCODE_CACHE_KEY = "moneee-passcode-cache"

  useEffect(() => {
    setPasscodeDraft(settings.passcode ?? "")
  }, [settings.passcode])

  if (!plan || !planId || !summary) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Plan builder"
          description="Create a plan with income, categories, debts, and goals to see live budgeting guidance."
          actions={
            <Button asChild>
              <Link href="/">
                Explore methods
              </Link>
            </Button>
          }
        />
        <EmptyState
          title="Add your first income source"
          description="Start with take-home pay and you'll unlock categories, debts, and goals."
          actions={
            <Button asChild variant="outline">
              <Link href="/">
                View onboarding tips
              </Link>
            </Button>
          }
        />
      </div>
    )
  }

  const handleIncomeChange = (update: Partial<IncomeInput>) => {
    actions.updatePlan?.((current) => ({
      ...current,
      income: {
        ...current.income,
        primary: {
          ...current.income.primary,
          ...update,
        },
      },
    }))
  }

  const handleExtraChange = (index: number, update: Partial<IncomeInput>) => {
    actions.updatePlan?.((current) => {
      const extras = [...(current.income.extras ?? [])]
      extras[index] = {
        ...extras[index],
        ...update,
      }
      return {
        ...current,
        income: {
          ...current.income,
          extras,
        },
      }
    })
  }

  const addExtraIncome = () => {
    actions.updatePlan?.((current) => ({
      ...current,
      income: {
        ...current.income,
        extras: [...(current.income.extras ?? []), { amount: 0, frequency: "monthly" }],
      },
    }))
  }

  const removeExtraIncome = (index: number) => {
    actions.updatePlan?.((current) => {
      const extras = [...(current.income.extras ?? [])]
      extras.splice(index, 1)
      return {
        ...current,
        income: {
          ...current.income,
          extras,
        },
      }
    })
  }

  const handleCategorySubmit = (category: Category) => {
    actions.upsertCategory?.(category)
    toast.success(`${category.name} saved`)
  }

  const handleDebtSubmit = (debt: Debt) => {
    actions.upsertDebt?.(debt)
    toast.success(`${debt.name} saved`)
  }

  const handleGoalSubmit = (goal: Goal) => {
    actions.upsertGoal?.(goal)
    toast.success(`${goal.name} saved`)
  }

  const sinkingFunds = plan.categories.filter(
    (category): category is SinkingFund => category.type === "sinking"
  )
  const debtBudget = summary.savings + summary.debt
  const lastUpdated = plan.meta?.updatedAt
    ? new Date(plan.meta.updatedAt).toLocaleString(settings.locale, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : undefined

  const handleModeChange = (mode: Plan["methodMode"]) => {
    actions.setMethodMode?.(mode)
  }

  const handleCurrencyChange = (currency: string) => {
    actions.updatePlan?.((current) => ({
      ...current,
      currency,
    }))
    setSettings({ currency: currency })
  }

  const savePasscode = () => {
    if (!passcodeDraft.trim()) {
      toast.error("Enter a passcode before enabling")
      return
    }
    setPasscode(passcodeDraft.trim())
    if (typeof window !== "undefined") {
      localStorage.setItem(PASSCODE_CACHE_KEY, passcodeDraft.trim())
    }
    toast.success("Passcode enabled")
  }

  const disablePasscode = () => {
    setPasscode(undefined)
    if (typeof window !== "undefined") {
      localStorage.removeItem(PASSCODE_CACHE_KEY)
    }
    setPasscodeDraft("")
    toast.success("Passcode disabled")
  }

  return (
    <div className="space-y-10">
      <PageHeader
        title="Plan builder"
        description="Model take-home pay, envelopes, sinking funds, and debts in one flexible workspace."
        eyebrow="Your plan"
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm" variant="outline">
              <Link href="/scenarios">Compare scenarios</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/export">Export</Link>
            </Button>
          </div>
        }
        meta={lastUpdated ? <span>Last saved {lastUpdated}</span> : <span>Changes stay on this device.</span>}
      />

      <Tabs defaultValue="simple" className="space-y-6">
        <TabsList className="flex w-full justify-start gap-2 overflow-x-auto rounded-full bg-muted/60 p-1">
          <TabsTrigger
            value="simple"
            className={cn(
              "flex-1 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition",
              "data-[state=active]:bg-background data-[state=active]:shadow-sm"
            )}
          >
            Simple mode
          </TabsTrigger>
          <TabsTrigger
            value="advanced"
            className={cn(
              "flex-1 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition",
              "data-[state=active]:bg-background data-[state=active]:shadow-sm"
            )}
          >
            Advanced
          </TabsTrigger>
        </TabsList>
        <TabsContent value="simple" className="space-y-6 pt-6">
          <Card className="rounded-2xl border border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle>Income</CardTitle>
              <CardDescription>Normalised automatically to monthly amounts.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
                <div className="space-y-2">
                  <Label htmlFor="income-amount">Net income</Label>
                  <Input
                    id="income-amount"
                    type="number"
                    value={plan.income.primary.amount}
                    onChange={(event) =>
                      handleIncomeChange({ amount: Number(event.target.value) })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="income-frequency">Frequency</Label>
                  <Select
                    value={plan.income.primary.frequency}
                    onValueChange={(value) => handleIncomeChange({ frequency: value as IncomeInput["frequency"] })}
                  >
                    <SelectTrigger id="income-frequency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FREQUENCIES.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Extra income</span>
                  <Button size="sm" variant="outline" onClick={addExtraIncome}>
                    Add extra
                  </Button>
                </div>
                {(plan.income.extras ?? []).map((income, index) => (
                  <div key={index} className="grid gap-3 rounded-md border p-3 sm:grid-cols-[2fr_1fr_auto]">
                    <Input
                      type="number"
                      value={income.amount}
                      onChange={(event) =>
                        handleExtraChange(index, { amount: Number(event.target.value) })
                      }
                    />
                    <Select
                      value={income.frequency}
                      onValueChange={(value) =>
                        handleExtraChange(index, { frequency: value as IncomeInput["frequency"] })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FREQUENCIES.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeExtraIncome(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-border/70 shadow-sm">
            <CardHeader className="flex items-start justify-between">
              <div>
                <CardTitle>Categories</CardTitle>
                <CardDescription>Assign each line to needs, wants, or savings.</CardDescription>
              </div>
              <Button size="sm" variant="outline" onClick={() => { setEditingCategory(undefined); setCategoryDialogOpen(true) }}>
                Add category
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <CategoryList
                categories={plan.categories}
                currency={plan.currency}
                locale={settings.locale}
                onEdit={(category) => { setEditingCategory(category); setCategoryDialogOpen(true) }}
                onRemove={(id) => actions.removeCategory?.(id)}
                onReorder={(ids) => actions.reorderCategories?.(ids)}
              />
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-border/70 shadow-sm">
            <CardHeader className="flex items-start justify-between">
              <div>
                <CardTitle>Debts</CardTitle>
                <CardDescription>Minimums roll into your savings/debt bucket.</CardDescription>
              </div>
              <Button size="sm" variant="outline" onClick={() => { setEditingDebt(undefined); setDebtDialogOpen(true) }}>
                Add debt
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {plan.debts.length === 0 ? (
                <EmptyState
                  title="No debts tracked yet"
                  description="Add credit cards, loans, or mortgages to see payoff timelines and plan coverage."
                  className="py-12"
                  actions={
                    <Button size="sm" onClick={() => { setEditingDebt(undefined); setDebtDialogOpen(true) }}>
                      Add debt
                    </Button>
                  }
                />
              ) : (
                <ul className="space-y-2 text-sm">
                  {plan.debts.map((debt) => (
                    <li key={debt.id} className="flex flex-col gap-3 rounded-xl border border-border/60 p-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="font-medium">{debt.name}</div>
                        <div className="text-xs text-muted-foreground">
                          Balance {formatCurrency(debt.balance, settings.locale, plan.currency)} · APR {debt.apr}% · Min {formatCurrency(debt.minimum, settings.locale, plan.currency)}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" onClick={() => { setEditingDebt(debt); setDebtDialogOpen(true) }}>
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => actions.removeDebt?.(debt.id)}>
                          Remove
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              <DebtWhatIf
                debts={plan.debts}
                monthlyBudget={Math.max(debtBudget, 0)}
                locale={settings.locale}
                currency={plan.currency}
              />
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-border/70 shadow-sm">
            <CardHeader className="flex items-start justify-between">
              <div>
                <CardTitle>Goals</CardTitle>
                <CardDescription>Keep tabs on your emergency fund and savings targets.</CardDescription>
              </div>
              <Button size="sm" variant="outline" onClick={() => { setEditingGoal(undefined); setGoalDialogOpen(true) }}>
                Add goal
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {plan.goals.length === 0 ? (
                <EmptyState
                  title="No goals on the radar"
                  description="Track savings targets or emergency funds to keep your method accountable."
                  className="py-10"
                  actions={
                    <Button size="sm" onClick={() => { setEditingGoal(undefined); setGoalDialogOpen(true) }}>
                      Add goal
                    </Button>
                  }
                />
              ) : (
                <ul className="space-y-2 text-sm">
                  {plan.goals.map((goal) => (
                    <li key={goal.id} className="flex flex-col gap-3 rounded-xl border border-border/60 p-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="font-medium">{goal.name}</div>
                        <div className="text-xs text-muted-foreground">
                          Target {formatCurrency(goal.target, settings.locale, plan.currency)} · Current {formatCurrency(goal.current, settings.locale, plan.currency)}
                          {goal.dueDate && <> · Due {goal.dueDate}</>}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" onClick={() => { setEditingGoal(goal); setGoalDialogOpen(true) }}>
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => actions.removeGoal?.(goal.id)}>
                          Remove
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6 pt-6">
          <Card className="rounded-2xl border border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle>Planning modes</CardTitle>
              <CardDescription>Switch between preset, zero-based, or envelope budgeting.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={plan.methodMode === "preset" ? "default" : "outline"}
                  onClick={() => handleModeChange("preset")}
                >
                  Preset
                </Button>
                <Button
                  variant={plan.methodMode === "zero" ? "default" : "outline"}
                  onClick={() => handleModeChange("zero")}
                >
                  Zero-based
                </Button>
                <Button
                  variant={plan.methodMode === "envelope" ? "default" : "outline"}
                  onClick={() => handleModeChange("envelope")}
                >
                  Envelope
                </Button>
              </div>
              {plan.methodMode === "zero" && summary.leftover !== 0 && (
                <p className="text-sm text-destructive">
                  Zero-based requires leftover to hit zero. Adjust categories by {summary.leftover > 0 ? "+" : "-"}
                  {formatCurrency(Math.abs(summary.leftover), settings.locale, plan.currency)}.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle>Sinking funds</CardTitle>
              <CardDescription>Automatic monthly split based on target and due date.</CardDescription>
            </CardHeader>
            <CardContent>
              {sinkingFunds.length === 0 ? (
                <EmptyState
                  title="No sinking funds yet"
                  description="Convert any category to a sinking fund to auto-calc monthly contributions."
                  className="py-12"
                />
              ) : (
                <Table>
                  <TableBody>
                    {sinkingFunds.map((fund) => (
                      <SinkingFundRow
                        key={fund.id}
                        fund={fund}
                        currency={plan.currency}
                        locale={settings.locale}
                        onEdit={(selected) => { setEditingCategory(selected); setCategoryDialogOpen(true) }}
                        onRemove={(id) => actions.removeCategory?.(id)}
                      />
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle>Envelope overview</CardTitle>
              <CardDescription>Caps with live remaining balances.</CardDescription>
            </CardHeader>
            <CardContent>
              <EnvelopeGrid
                categories={plan.categories}
                currency={plan.currency}
                locale={settings.locale}
                onEdit={(category) => { setEditingCategory(category); setCategoryDialogOpen(true) }}
                onRemove={(id) => actions.removeCategory?.(id)}
              />
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle>Privacy lock</CardTitle>
              <CardDescription>Optional passcode saved locally on this device.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="passcode-input">Passcode</Label>
                <Input
                  id="passcode-input"
                  type="password"
                  value={passcodeDraft}
                  onChange={(event) => setPasscodeDraft(event.target.value)}
                  placeholder="Set a 4+ digit code"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={savePasscode}>
                  {settings.enablePasscode ? "Update passcode" : "Enable passcode"}
                </Button>
                {settings.enablePasscode && (
                  <Button variant="outline" size="sm" onClick={disablePasscode}>
                    Disable
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Passcode is stored offline. Forgetting it means you must clear local data.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Locale & currency</CardTitle>
              <CardDescription>All exports use this format.</CardDescription>
            </CardHeader>
            <CardContent>
              <LocaleCurrencyPicker
                currency={plan.currency}
                locale={settings.locale}
                onCurrencyChange={handleCurrencyChange}
                onLocaleChange={(locale) => setSettings({ locale })}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <CategoryFormDialog
        open={categoryDialogOpen}
        onOpenChange={setCategoryDialogOpen}
        onSubmit={handleCategorySubmit}
        initialCategory={editingCategory}
      />
      <DebtFormDialog
        open={debtDialogOpen}
        onOpenChange={setDebtDialogOpen}
        onSubmit={handleDebtSubmit}
        initialDebt={editingDebt}
      />
      <GoalFormDialog
        open={goalDialogOpen}
        onOpenChange={setGoalDialogOpen}
        onSubmit={handleGoalSubmit}
        initialGoal={editingGoal}
      />
    </div>
  )
}
