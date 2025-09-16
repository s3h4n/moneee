"use client"

import { format, parseISO } from "date-fns"
import { Button } from "@/components/ui/button"
import { TableCell, TableRow } from "@/components/ui/table"
import { formatCurrency, sinkingMonthly } from "@/lib/budget"
import type { SinkingFund } from "@/types"
import { Pencil, Trash } from "lucide-react"

interface SinkingFundRowProps {
  fund: SinkingFund
  locale: string
  currency: string
  onEdit?: (fund: SinkingFund) => void
  onRemove?: (id: string) => void
}

export function SinkingFundRow({ fund, locale, currency, onEdit, onRemove }: SinkingFundRowProps) {
  const monthly = sinkingMonthly(fund.target, fund.dueDate)

  return (
    <TableRow>
      <TableCell className="font-medium">{fund.name}</TableCell>
      <TableCell>{formatCurrency(fund.target, locale, currency)}</TableCell>
      <TableCell>{format(parseISO(fund.dueDate), "MMM yyyy")}</TableCell>
      <TableCell>{formatCurrency(monthly, locale, currency)}</TableCell>
      <TableCell className="flex items-center justify-end gap-2">
        {onEdit && (
          <Button variant="ghost" size="icon" onClick={() => onEdit(fund)} aria-label={`Edit ${fund.name}`}>
            <Pencil className="h-4 w-4" />
          </Button>
        )}
        {onRemove && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRemove(fund.id)}
            aria-label={`Remove ${fund.name}`}
          >
            <Trash className="h-4 w-4" />
          </Button>
        )}
      </TableCell>
    </TableRow>
  )
}
