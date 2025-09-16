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
import type { Goal } from "@/types"
import { createId } from "@/lib/id"

interface GoalFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (goal: Goal) => void
  initialGoal?: Goal
}

interface FormState {
  id: string
  name: string
  target: string
  current: string
  dueDate?: string
}

const defaultState: FormState = {
  id: "",
  name: "",
  target: "",
  current: "",
}

export function GoalFormDialog({ open, onOpenChange, onSubmit, initialGoal }: GoalFormDialogProps) {
  const [form, setForm] = useState<FormState>(defaultState)

  useEffect(() => {
    if (initialGoal) {
      setForm({
        id: initialGoal.id,
        name: initialGoal.name,
        target: String(initialGoal.target),
        current: String(initialGoal.current),
        dueDate: initialGoal.dueDate,
      })
    } else {
      setForm({ ...defaultState, id: createId("goal") })
    }
  }, [initialGoal, open])

  const handleSubmit = () => {
    const goal: Goal = {
      id: form.id || createId("goal"),
      name: form.name,
      target: Number(form.target),
      current: Number(form.current),
      dueDate: form.dueDate || undefined,
    }
    onSubmit(goal)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialGoal ? "Edit goal" : "Add goal"}</DialogTitle>
          <DialogDescription>Track progress towards your savings milestones.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="goal-name">Name</Label>
            <Input
              id="goal-name"
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            />
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="goal-target">Target</Label>
              <Input
                id="goal-target"
                type="number"
                min={0}
                value={form.target}
                onChange={(event) => setForm((prev) => ({ ...prev, target: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="goal-current">Current</Label>
              <Input
                id="goal-current"
                type="number"
                min={0}
                value={form.current}
                onChange={(event) => setForm((prev) => ({ ...prev, current: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="goal-due">Due date (optional)</Label>
              <Input
                id="goal-due"
                type="date"
                value={form.dueDate ?? ""}
                onChange={(event) => setForm((prev) => ({ ...prev, dueDate: event.target.value }))}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" onClick={handleSubmit}>
            {initialGoal ? "Update" : "Add"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
