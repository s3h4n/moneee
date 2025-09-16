"use client";

import { cn } from "@/lib/utils";
import { formatCurrency, type PlanSummary } from "@/lib/budget";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SummaryBarProps {
  summary?: PlanSummary;
  currency: string;
  locale: string;
  className?: string;
}

export function SummaryBar({
  summary,
  currency,
  locale,
  className,
}: SummaryBarProps) {
  if (!summary) return null;

  const items: Array<{
    key: string;
    label: string;
    value: number;
    emphasise?: boolean;
  }> = [
    { key: "income", label: "Income", value: summary.income },
    { key: "needs", label: "Needs", value: summary.needs },
    { key: "wants", label: "Wants", value: summary.wants },
    {
      key: "savingsDebt",
      label: "Savings / Debt",
      value: summary.savings + summary.debt,
    },
    {
      key: "leftover",
      label: "Leftover",
      value: summary.leftover,
      emphasise: summary.leftover !== 0,
    },
  ];

  return (
    <div
      className={cn(
        "sticky bottom-0 left-0 right-0 z-30 border-t border-border/70 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70",
        className
      )}
      role="region"
      aria-label="Plan summary"
    >
      <div className="mx-auto w-full max-w-6xl px-4 py-3 sm:py-4">
        {/* <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-5"> */}
        <ScrollArea className="w-full">
          <div className="flex h-full justify-between gap-3 text-sm min-w-max">
            {items.map(({ key, label, value, emphasise }) => {
              const formatted = formatCurrency(value, locale, currency);
              const isNegative = value < 0;
              return (
                <div
                  key={key}
                  className={cn(
                    "rounded-xl border w-full border-transparent bg-card/70 px-3 py-2 shadow-sm backdrop-blur transition hover:border-primary/40",
                    emphasise ? "ring-1 ring-inset ring-primary/40" : undefined
                  )}
                >
                  <p className="text-[0.7rem] font-semibold uppercase tracking-wide text-muted-foreground">
                    {label}
                  </p>
                  <p
                    className={cn(
                      "text-sm font-semibold",
                      emphasise
                        ? isNegative
                          ? "text-destructive"
                          : "text-emerald-600 dark:text-emerald-400"
                        : undefined
                    )}
                  >
                    {formatted}
                  </p>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
