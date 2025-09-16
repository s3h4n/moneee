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
import type { Debt } from "@/types"
import { createId } from "@/lib/id"

interface DebtFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (debt: Debt) => void
  initialDebt?: Debt
}

interface FormState {
  id: string
  name: string
  balance: string
  apr: string
  minimum: string
}

const defaultState: FormState = {
  id: "",
  name: "",
  balance: "",
  apr: "",
  minimum: "",
}

export function DebtFormDialog({ open, onOpenChange, onSubmit, initialDebt }: DebtFormDialogProps) {
  const [form, setForm] = useState<FormState>(defaultState)

  useEffect(() => {
    if (initialDebt) {
      setForm({
        id: initialDebt.id,
        name: initialDebt.name,
        balance: String(initialDebt.balance),
        apr: String(initialDebt.apr),
        minimum: String(initialDebt.minimum),
      })
    } else {
      setForm({ ...defaultState, id: createId("debt") })
    }
  }, [initialDebt, open])

  const handleSubmit = () => {
    const debt: Debt = {
      id: form.id || createId("debt"),
      name: form.name,
      balance: Number(form.balance),
      apr: Number(form.apr),
      minimum: Number(form.minimum),
    }
    onSubmit(debt)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialDebt ? "Edit debt" : "Add debt"}</DialogTitle>
          <DialogDescription>Preview snowball vs avalanche with transparent assumptions.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="debt-name">Name</Label>
            <Input
              id="debt-name"
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            />
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="debt-balance">Balance</Label>
              <Input
                id="debt-balance"
                type="number"
                min={0}
                value={form.balance}
                onChange={(event) => setForm((prev) => ({ ...prev, balance: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="debt-apr">APR %</Label>
              <Input
                id="debt-apr"
                type="number"
                min={0}
                step={0.1}
                value={form.apr}
                onChange={(event) => setForm((prev) => ({ ...prev, apr: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="debt-minimum">Minimum</Label>
              <Input
                id="debt-minimum"
                type="number"
                min={0}
                value={form.minimum}
                onChange={(event) => setForm((prev) => ({ ...prev, minimum: event.target.value }))}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" onClick={handleSubmit}>
            {initialDebt ? "Update" : "Add"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
