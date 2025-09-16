"use client"

import { useMemo, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency, snowball, avalanche, type DebtPayoffSummary } from "@/lib/budget"
import type { Debt } from "@/types"

interface DebtWhatIfProps {
  debts: Debt[]
  monthlyBudget: number
  locale: string
  currency: string
}

interface StrategyConfig {
  key: "snowball" | "avalanche"
  label: string
  summary: DebtPayoffSummary
}

export function DebtWhatIf({ debts, monthlyBudget, locale, currency }: DebtWhatIfProps) {
  const [active, setActive] = useState<"snowball" | "avalanche">("snowball")

  const strategies = useMemo<StrategyConfig[]>(() => {
    const snowballSummary = snowball(debts, monthlyBudget)
    const avalancheSummary = avalanche(debts, monthlyBudget)
    return [
      { key: "snowball", label: "Snowball", summary: snowballSummary },
      { key: "avalanche", label: "Avalanche", summary: avalancheSummary },
    ]
  }, [debts, monthlyBudget])

  if (debts.length === 0) {
    return <p className="text-sm text-muted-foreground">Add debts to preview payoff strategies.</p>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Debt payoff preview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={active} onValueChange={(value) => setActive(value as "snowball" | "avalanche")}> 
          <TabsList>
            {strategies.map((strategy) => (
              <TabsTrigger key={strategy.key} value={strategy.key}>
                {strategy.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {strategies.map((strategy) => (
            <TabsContent key={strategy.key} value={strategy.key} className="space-y-4">
              {strategy.summary.insufficientBudget ? (
                <p className="text-sm text-destructive">
                  Monthly amount is not enough to cover minimum payments. Increase your debt allocation.
                </p>
              ) : (
                <div className="grid gap-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Months to debt-free</span>
                    <span>{
                      strategy.summary.monthsToDebtFree === Infinity
                        ? "—"
                        : `${strategy.summary.monthsToDebtFree} months`
                    }</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Total interest</span>
                    <span>{
                      strategy.summary.totalInterest === Infinity
                        ? "—"
                        : formatCurrency(strategy.summary.totalInterest, locale, currency)
                    }</span>
                  </div>
                </div>
              )}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Debt</TableHead>
                    <TableHead className="text-right">Months</TableHead>
                    <TableHead className="text-right">Interest</TableHead>
                    <TableHead className="text-right">Total paid</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {strategy.summary.steps.map((step) => (
                    <TableRow key={step.debtId}>
                      <TableCell>{step.name}</TableCell>
                      <TableCell className="text-right">
                        {step.months === Infinity ? "—" : step.months}
                      </TableCell>
                      <TableCell className="text-right">
                        {step.interestPaid === Infinity
                          ? "—"
                          : formatCurrency(step.interestPaid, locale, currency)}
                      </TableCell>
                      <TableCell className="text-right">
                        {step.totalPaid === Infinity
                          ? "—"
                          : formatCurrency(step.totalPaid, locale, currency)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}
