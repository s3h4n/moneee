"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/budget"
import type { Category } from "@/types"
import { Pencil, Trash } from "lucide-react"

interface EnvelopeGridProps {
  categories: Category[]
  locale: string
  currency: string
  onEdit?: (category: Category) => void
  onRemove?: (id: string) => void
}

export function EnvelopeGrid({ categories, locale, currency, onEdit, onRemove }: EnvelopeGridProps) {
  const envelopes = categories.filter((category) => category.type === "envelope")
  if (envelopes.length === 0) {
    return <p className="text-sm text-muted-foreground">No envelopes yet. Add one to start tracking caps.</p>
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {envelopes.map((envelope) => {
        const cap = envelope.capMonthly ?? envelope.amountMonthly
        const used = envelope.amountMonthly
        const remaining = Math.max(cap - used, 0)
        const ratio = cap > 0 ? Math.min((used / cap) * 100, 100) : 0

        return (
          <Card key={envelope.id} className="flex flex-col">
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle className="text-base">{envelope.name}</CardTitle>
                <p className="text-xs text-muted-foreground">Cap {formatCurrency(cap, locale, currency)}</p>
              </div>
              <div className="flex items-center gap-1">
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(envelope)}
                    aria-label={`Edit ${envelope.name}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}
                {onRemove && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemove(envelope.id)}
                    aria-label={`Remove ${envelope.name}`}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-3">
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Planned</span>
                  <span>{formatCurrency(used, locale, currency)}</span>
                </div>
                <Progress value={ratio} className="h-2" />
              </div>
              <div className="mt-auto text-xs text-muted-foreground">
                Remaining {formatCurrency(remaining, locale, currency)}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
