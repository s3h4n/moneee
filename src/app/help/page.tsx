"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";

const steps: {
  title: string;
  description: string;
  actions?: { label: string; href: string; variant?: "default" | "outline" | "ghost" }[];
  tips?: string[];
}[] = [
  {
    title: "Create or choose your plan",
    description:
      "Use the plan switcher in the top bar to revisit an existing budget. Start a fresh workspace with the New plan button when you want to model a new scenario.",
    actions: [{ label: "Open plan builder", href: "/plan" }],
    tips: [
      "Plans are stored locally on this device—nothing is sent to a server.",
      "Rename plans from the Plan builder sidebar to keep things organised.",
    ],
  },
  {
    title: "Record your income",
    description:
      "Head to the Plan builder to enter take-home pay. Add extra income streams and pick the frequency that matches how money arrives.",
    tips: [
      "The annual totals update automatically as you enter monthly amounts.",
      "Toggle the locale and currency settings in the Plan builder if you're planning across regions.",
    ],
  },
  {
    title: "Map spending categories",
    description:
      "List the bills, essentials, and lifestyle categories that matter. Assign each one to Needs, Wants, Savings, or Debt so the method presets know where to allocate funds.",
    tips: [
      "Use sinking funds for upcoming expenses that you want to spread across months.",
      "Archive a category when you no longer need it—the history stays intact.",
    ],
  },
  {
    title: "Add goals, debts, and safety buffers",
    description:
      "Track debt paydown targets and savings goals directly in the Plan builder. The summary bar highlights progress and nudges when something looks off.",
  },
  {
    title: "Pick your budgeting method",
    description:
      "Switch to the Methods tab to compare presets like 50/30/20 or your own saved rules. Applying a preset keeps slider totals aligned with your current plan inputs.",
    actions: [{ label: "Explore methods", href: "/" }],
    tips: [
      "Save custom presets once you've tuned the sliders to fit your lifestyle.",
      "Percentages update in real time alongside the income from your active plan.",
    ],
  },
  {
    title: "Stress-test and share",
    description:
      "Run what-if changes in the Scenarios tab to see how income bumps or expense cuts ripple through your budget. Export or print a clean summary when you're ready to share.",
    actions: [
      { label: "Open scenarios", href: "/scenarios" },
      { label: "Go to export", href: "/export", variant: "outline" },
    ],
  },
];

export default function HelpPage() {
  return (
    <div className="space-y-8 sm:space-y-10">
      <PageHeader
        title="Help & getting started"
        description="Follow the guided steps below to build a solid plan, tune budgeting rules, and review your progress."
        eyebrow="Guided walkthrough"
        meta="Need a quick refresher? Bookmark this page—everything works offline."
      />

      <section className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Step-by-step checklist</CardTitle>
            <CardDescription>Move through each step in order or jump straight to the part you need.</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="space-y-5">
              {steps.map((step, index) => (
                <li
                  key={step.title}
                  className="rounded-2xl border border-border/60 bg-muted/30 p-4 sm:p-5"
                >
                  <div className="flex gap-4">
                    <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {index + 1}
                    </div>
                    <div className="space-y-3">
                      <div>
                        <h2 className="text-base font-semibold sm:text-lg">{step.title}</h2>
                        <p className="mt-1 text-sm text-muted-foreground sm:text-base">
                          {step.description}
                        </p>
                      </div>
                      {step.tips ? (
                        <ul className="list-disc space-y-1 pl-5 text-xs text-muted-foreground/90 sm:text-sm">
                          {step.tips.map((tip) => (
                            <li key={tip}>{tip}</li>
                          ))}
                        </ul>
                      ) : null}
                      {step.actions ? (
                        <div className="flex flex-wrap gap-2">
                          {step.actions.map((action) => (
                            <Button
                              key={action.href}
                              asChild
                              variant={action.variant ?? "default"}
                              size="sm"
                            >
                              <Link href={action.href}>{action.label}</Link>
                            </Button>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick links</CardTitle>
              <CardDescription>Jump directly to the workspace that matches each step.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <div className="flex items-start justify-between gap-4 rounded-xl border border-border/50 bg-background/80 px-4 py-3">
                <div>
                  <span className="font-medium text-foreground">Plan builder</span>
                  <p className="text-xs text-muted-foreground sm:text-sm">
                    Capture income, categories, debts, and savings goals.
                  </p>
                </div>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/plan">Open</Link>
                </Button>
              </div>
              <div className="flex items-start justify-between gap-4 rounded-xl border border-border/50 bg-background/80 px-4 py-3">
                <div>
                  <span className="font-medium text-foreground">Methods</span>
                  <p className="text-xs text-muted-foreground sm:text-sm">
                    Compare budgeting rules and save the ones you like.
                  </p>
                </div>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/">Open</Link>
                </Button>
              </div>
              <div className="flex items-start justify-between gap-4 rounded-xl border border-border/50 bg-background/80 px-4 py-3">
                <div>
                  <span className="font-medium text-foreground">Scenarios</span>
                  <p className="text-xs text-muted-foreground sm:text-sm">
                    Model raises, cuts, and savings accelerators before they happen.
                  </p>
                </div>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/scenarios">Open</Link>
                </Button>
              </div>
              <div className="flex items-start justify-between gap-4 rounded-xl border border-border/50 bg-background/80 px-4 py-3">
                <div>
                  <span className="font-medium text-foreground">Export</span>
                  <p className="text-xs text-muted-foreground sm:text-sm">
                    Download JSON or print an at-a-glance summary for sharing.
                  </p>
                </div>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/export">Open</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tips & troubleshooting</CardTitle>
              <CardDescription>Keep these reminders handy if something feels off.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                Totals look uneven? Check the Reality check chip at the top of each page—it flags overspending or underfunded goals instantly.
              </p>
              <p>
                Want to start from scratch? Use the Delete all data link in the footer. Because everything is stored locally, this fully clears the app on this device.
              </p>
              <p>
                Planning with someone else? Export and share the JSON file so collaborators can import it into their own offline workspace.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

