"use client"

import { useMemo } from "react"
import { calculatePlanSummary, formatCurrency, resolveCategoryAmount } from "@/lib/budget"
import type { Plan } from "@/types"

interface PrintViewProps {
  plan: Plan
  locale: string
  currency: string
}

export function PrintView({ plan, locale, currency }: PrintViewProps) {
  const summary = useMemo(() => calculatePlanSummary(plan), [plan])

  return (
    <div className="mx-auto max-w-4xl space-y-8 bg-white p-8 text-sm text-black">
      <header className="border-b pb-4">
        <h1 className="text-2xl font-semibold">{plan.name}</h1>
        <p className="text-muted-foreground">
          Prepared on {new Date(plan.meta.updatedAt).toLocaleDateString(locale)}
        </p>
      </header>

      <section>
        <h2 className="mb-2 text-lg font-semibold">Summary</h2>
        <dl className="grid gap-2 sm:grid-cols-2">
          <div className="flex justify-between">
            <dt>Monthly income</dt>
            <dd>{formatCurrency(summary.income, locale, currency)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Needs</dt>
            <dd>{formatCurrency(summary.needs, locale, currency)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Wants</dt>
            <dd>{formatCurrency(summary.wants, locale, currency)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Savings / Debt</dt>
            <dd>{formatCurrency(summary.savings + summary.debt, locale, currency)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Leftover</dt>
            <dd>{formatCurrency(summary.leftover, locale, currency)}</dd>
          </div>
        </dl>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold">Income</h2>
        <table className="w-full border text-left text-xs">
          <thead>
            <tr className="bg-muted text-muted-foreground">
              <th className="p-2">Source</th>
              <th className="p-2">Amount</th>
              <th className="p-2">Frequency</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-2">Primary</td>
              <td className="p-2">{plan.income.primary.amount}</td>
              <td className="p-2">{plan.income.primary.frequency}</td>
            </tr>
            {(plan.income.extras ?? []).map((income, index) => (
              <tr key={index}>
                <td className="p-2">Extra {index + 1}</td>
                <td className="p-2">{income.amount}</td>
                <td className="p-2">{income.frequency}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold">Categories</h2>
        <table className="w-full border text-left text-xs">
          <thead>
            <tr className="bg-muted text-muted-foreground">
              <th className="p-2">Name</th>
              <th className="p-2">Type</th>
              <th className="p-2">Bucket</th>
              <th className="p-2 text-right">Monthly</th>
            </tr>
          </thead>
          <tbody>
            {plan.categories.map((category) => (
              <tr key={category.id}>
                <td className="p-2">{category.name}</td>
                <td className="p-2">{category.type}</td>
                <td className="p-2">{category.bucket}</td>
                <td className="p-2 text-right">
                  {formatCurrency(resolveCategoryAmount(category), locale, currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {plan.debts.length > 0 && (
        <section>
          <h2 className="mb-2 text-lg font-semibold">Debts</h2>
          <table className="w-full border text-left text-xs">
            <thead>
              <tr className="bg-muted text-muted-foreground">
                <th className="p-2">Name</th>
                <th className="p-2 text-right">Balance</th>
                <th className="p-2 text-right">APR</th>
                <th className="p-2 text-right">Minimum</th>
              </tr>
            </thead>
            <tbody>
              {plan.debts.map((debt) => (
                <tr key={debt.id}>
                  <td className="p-2">{debt.name}</td>
                  <td className="p-2 text-right">{formatCurrency(debt.balance, locale, currency)}</td>
                  <td className="p-2 text-right">{debt.apr}%</td>
                  <td className="p-2 text-right">{formatCurrency(debt.minimum, locale, currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {plan.goals.length > 0 && (
        <section>
          <h2 className="mb-2 text-lg font-semibold">Goals</h2>
          <table className="w-full border text-left text-xs">
            <thead>
              <tr className="bg-muted text-muted-foreground">
                <th className="p-2">Name</th>
                <th className="p-2 text-right">Target</th>
                <th className="p-2 text-right">Current</th>
                <th className="p-2">Due</th>
              </tr>
            </thead>
            <tbody>
              {plan.goals.map((goal) => (
                <tr key={goal.id}>
                  <td className="p-2">{goal.name}</td>
                  <td className="p-2 text-right">{formatCurrency(goal.target, locale, currency)}</td>
                  <td className="p-2 text-right">{formatCurrency(goal.current, locale, currency)}</td>
                  <td className="p-2">{goal.dueDate ? goal.dueDate : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  )
}
