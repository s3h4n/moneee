"use client";

import { cn } from "@/lib/utils";
import { formatCurrency, type PlanSummary } from "@/lib/budget";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

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

  const items = [
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
        <ScrollArea className="w-full">
          {/* Mobile: force horizontal overflow; Desktop: allow normal flex fill */}
          <div className="flex h-full gap-3 text-sm min-w-max sm:min-w-0">
            {items.map(({ key, label, value, emphasise }) => {
              const formatted = formatCurrency(value, locale, currency);
              const isNegative = value < 0;
              return (
                <div
                  key={key}
                  className={cn(
                    // Mobile: fixed card width + no flex growth
                    // Desktop (sm+): let items flex and fill
                    "flex-none w-[160px] rounded-xl border border-transparent bg-card/70 px-3 py-2 shadow-sm backdrop-blur transition hover:border-primary/40 sm:flex-1 sm:w-auto",
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

          {/* Horizontal scrollbar shows when needed (mostly on mobile) */}
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  );
}
