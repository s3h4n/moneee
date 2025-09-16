import { ReactNode, useId } from "react"
import { cn } from "@/lib/utils"

interface PageHeaderProps {
  title: string
  description?: string
  eyebrow?: string
  actions?: ReactNode
  className?: string
  align?: "start" | "center"
  meta?: ReactNode
}

export function PageHeader({
  title,
  description,
  eyebrow,
  actions,
  className,
  align = "start",
  meta,
}: PageHeaderProps) {
  const headingId = useId()

  return (
    <section
      className={cn(
        "space-y-4 rounded-2xl border border-border/60 bg-gradient-to-br from-background via-background to-muted/20 px-4 py-6 shadow-sm transition-colors sm:px-6",
        align === "center" && "text-center",
        className
      )}
      aria-labelledby={headingId}
    >
      <div
        className={cn(
          "flex flex-col gap-6 sm:flex-row sm:items-center",
          align === "center" && "sm:flex-col"
        )}
      >
        <div className="flex-1 space-y-2">
          {eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {eyebrow}
            </p>
          ) : null}
          <h1 id={headingId} className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {title}
          </h1>
          {description ? (
            <p className="max-w-3xl text-sm text-muted-foreground sm:text-base">
              {description}
            </p>
          ) : null}
          {meta ? <div className="text-xs text-muted-foreground/80 sm:text-sm">{meta}</div> : null}
        </div>
        {actions ? <div className="flex flex-col gap-3 sm:items-end">{actions}</div> : null}
      </div>
    </section>
  )
}
