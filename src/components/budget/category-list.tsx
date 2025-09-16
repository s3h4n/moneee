"use client"

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatCurrency, resolveCategoryAmount } from "@/lib/budget"
import type { Category } from "@/types"
import { ArrowDown, ArrowUp, Pencil, Trash } from "lucide-react"

interface CategoryListProps {
  categories: Category[]
  locale: string
  currency: string
  onEdit?: (category: Category) => void
  onRemove?: (id: string) => void
  onReorder?: (orderedIds: string[]) => void
}

export function CategoryList({
  categories,
  locale,
  currency,
  onEdit,
  onRemove,
  onReorder,
}: CategoryListProps) {
  if (categories.length === 0) {
    return <p className="text-sm text-muted-foreground">No categories yet.</p>
  }

  const move = (categoryId: string, direction: -1 | 1) => {
    if (!onReorder) return
    const index = categories.findIndex((category) => category.id === categoryId)
    if (index < 0) return
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= categories.length) return
    const next = [...categories]
    const [item] = next.splice(index, 1)
    next.splice(targetIndex, 0, item)
    onReorder(next.map((category) => category.id))
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Bucket</TableHead>
          <TableHead className="text-right">Monthly</TableHead>
          <TableHead className="w-[160px] text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {categories.map((category, index) => (
          <TableRow key={category.id}>
            <TableCell className="font-medium">{category.name}</TableCell>
            <TableCell>{category.type}</TableCell>
            <TableCell>{category.bucket}</TableCell>
            <TableCell className="text-right">
              {formatCurrency(resolveCategoryAmount(category), locale, currency)}
            </TableCell>
            <TableCell className="flex justify-end gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => move(category.id, -1)}
                disabled={index === 0}
                aria-label={`Move ${category.name} up`}
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => move(category.id, 1)}
                disabled={index === categories.length - 1}
                aria-label={`Move ${category.name} down`}
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
              {onEdit && (
                <Button variant="ghost" size="icon" onClick={() => onEdit(category)} aria-label={`Edit ${category.name}`}>
                  <Pencil className="h-4 w-4" />
                </Button>
              )}
              {onRemove && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemove(category.id)}
                  aria-label={`Remove ${category.name}`}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
