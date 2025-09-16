import { ElementType, ReactNode } from "react"
import { cn } from "@/lib/utils"

interface EmptyStateProps {
  title: string
  description: string
  icon?: ElementType<{ className?: string }>
  actions?: ReactNode
  className?: string
}

export function EmptyState({ title, description, icon: Icon, actions, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/70 bg-muted/40 px-6 py-14 text-center",
        className
      )}
      role="status"
      aria-live="polite"
    >
      {Icon ? <Icon className="h-10 w-10 text-muted-foreground/70" aria-hidden /> : null}
      <div className="space-y-1">
        <p className="text-base font-medium sm:text-lg">{title}</p>
        <p className="text-sm text-muted-foreground sm:text-base">{description}</p>
      </div>
      {actions ? <div className="mt-2 flex flex-wrap justify-center gap-2">{actions}</div> : null}
    </div>
  )
}
