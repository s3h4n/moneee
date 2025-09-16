"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Category, CategoryType, BudgetBucket, SinkingFund } from "@/types"
import { createId } from "@/lib/id"

interface CategoryFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (category: Category) => void
  initialCategory?: Category
}

interface FormState {
  id: string
  name: string
  type: CategoryType
  bucket: BudgetBucket
  amountMonthly: string
  capMonthly?: string
  target?: string
  dueDate?: string
}

const defaultState: FormState = {
  id: "",
  name: "",
  type: "fixed",
  bucket: "needs",
  amountMonthly: "",
}

export function CategoryFormDialog({ open, onOpenChange, onSubmit, initialCategory }: CategoryFormDialogProps) {
  const [form, setForm] = useState<FormState>(defaultState)

  useEffect(() => {
    if (initialCategory) {
      setForm({
        id: initialCategory.id,
        name: initialCategory.name,
        type: initialCategory.type,
        bucket: initialCategory.bucket,
        amountMonthly: String(initialCategory.amountMonthly ?? ""),
        capMonthly: initialCategory.capMonthly ? String(initialCategory.capMonthly) : undefined,
        target: initialCategory.type === "sinking" ? String(initialCategory.target) : undefined,
        dueDate: initialCategory.type === "sinking" ? initialCategory.dueDate : undefined,
      })
    } else {
      setForm({
        ...defaultState,
        id: createId("category"),
      })
    }
  }, [initialCategory, open])

  const handleSubmit = () => {
    const amountMonthly = Number(form.amountMonthly)
    if (!Number.isFinite(amountMonthly)) return
    const base: Category = {
      id: form.id || createId("category"),
      name: form.name,
      type: form.type,
      bucket: form.bucket,
      amountMonthly,
      capMonthly: form.capMonthly ? Number(form.capMonthly) : undefined,
    }
    let final: Category = base
    if (form.type === "sinking") {
      const target = Number(form.target ?? 0)
      const dueDate = form.dueDate ?? new Date().toISOString().slice(0, 10)
      final = {
        ...base,
        type: "sinking",
        target,
        dueDate,
      } as SinkingFund
    }
    onSubmit(final)
    onOpenChange(false)
  }

  const isSinking = form.type === "sinking"
  const isEnvelope = form.type === "envelope"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialCategory ? "Edit category" : "Add category"}</DialogTitle>
          <DialogDescription>Plan how much to set aside for this category each month.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="category-name">Name</Label>
            <Input
              id="category-name"
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            />
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="category-type">Type</Label>
              <Select
                value={form.type}
                onValueChange={(value: CategoryType) =>
                  setForm((prev) => ({
                    ...prev,
                    type: value,
                    bucket: value === "sinking" ? "savings" : prev.bucket,
                  }))
                }
              >
                <SelectTrigger id="category-type">
                  <SelectValue placeholder="Pick a type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Fixed</SelectItem>
                  <SelectItem value="variable">Variable</SelectItem>
                  <SelectItem value="sinking">Sinking fund</SelectItem>
                  <SelectItem value="envelope">Envelope</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category-bucket">Bucket</Label>
              <Select
                value={form.bucket}
                onValueChange={(value: BudgetBucket) =>
                  setForm((prev) => ({
                    ...prev,
                    bucket: value,
                  }))
                }
                disabled={isSinking}
              >
                <SelectTrigger id="category-bucket">
                  <SelectValue placeholder="Pick bucket" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="needs">Needs</SelectItem>
                  <SelectItem value="wants">Wants</SelectItem>
                  <SelectItem value="savings">Savings</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="category-amount">Monthly allocation</Label>
            <Input
              id="category-amount"
              type="number"
              min={0}
              value={form.amountMonthly}
              onChange={(event) => setForm((prev) => ({ ...prev, amountMonthly: event.target.value }))}
            />
          </div>
          {isEnvelope && (
            <div className="grid gap-2">
              <Label htmlFor="category-cap">Envelope cap (optional)</Label>
              <Input
                id="category-cap"
                type="number"
                min={0}
                value={form.capMonthly ?? ""}
                onChange={(event) => setForm((prev) => ({ ...prev, capMonthly: event.target.value }))}
              />
            </div>
          )}
          {isSinking && (
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="category-target">Target amount</Label>
                <Input
                  id="category-target"
                  type="number"
                  min={0}
                  value={form.target ?? ""}
                  onChange={(event) => setForm((prev) => ({ ...prev, target: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category-due">Due date</Label>
                <Input
                  id="category-due"
                  type="date"
                  value={form.dueDate ?? ""}
                  onChange={(event) => setForm((prev) => ({ ...prev, dueDate: event.target.value }))}
                />
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button type="button" onClick={handleSubmit}>
            {initialCategory ? "Update" : "Add"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
