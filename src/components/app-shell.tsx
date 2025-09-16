"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode } from "react";
import { Menu, Plus, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  SummaryBar,
  RealityCheckChip,
  PlanWarnings,
} from "@/components/budget";
import { useActivePlan } from "@/hooks/use-active-plan";
import { usePlanMetrics } from "@/hooks/use-plan-metrics";
import { useSettings } from "@/hooks/use-settings";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import { useBudgetStore } from "@/store/use-budget-store";
import { createId } from "@/lib/id";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PasscodeGate } from "@/components/passcode-gate";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

interface AppShellProps {
  children: ReactNode;
}

const NAV_ITEMS = [
  { href: "/", label: "Dashboard" },
  { href: "/methods", label: "Methods" },
  { href: "/plan", label: "Plan" },
  { href: "/scenarios", label: "Scenarios" },
  { href: "/export", label: "Export" },
  { href: "/help", label: "Help" },
];

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { plan, planId } = useActivePlan();
  const { summary, warnings, realityCheck } = usePlanMetrics(plan);
  const { settings, deleteAllData } = useSettings();
  const createPlan = useBudgetStore((state) => state.createPlan);
  const plans = useBudgetStore((state) => state.plans);
  const setActivePlan = useBudgetStore((state) => state.setActivePlan);
  const currentPlanValue = planId ?? Object.values(plans)[0]?.id ?? "";

  const handleNewPlan = () => {
    const id = createPlan(`Plan ${createId().slice(-4)}`);
    if (id) {
      router.push("/plan");
    }
  };

  const renderNavItems = ({ inSheet = false }: { inSheet?: boolean } = {}) => (
    <nav className="flex flex-col gap-2 md:flex-row md:items-center md:gap-1">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href;
        const itemClass = cn(
          "inline-flex rounded-full px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          isActive
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
        );

        const content = (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={itemClass}
          >
            {item.label}
          </Link>
        );

        return inSheet ? (
          <SheetClose asChild key={item.href}>
            {content}
          </SheetClose>
        ) : (
          content
        );
      })}
    </nav>
  );

  return (
    <PasscodeGate
      enabled={settings.enablePasscode}
      passcode={settings.passcode}
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.08),_transparent_55%)]">
        <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:gap-4 sm:py-4">
            <div className="flex items-center gap-2">
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    aria-label="Open navigation"
                  >
                    <Menu className="h-5 w-5" aria-hidden />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="flex flex-col gap-6 px-4">
                  <SheetHeader>
                    <SheetTitle className="text-left text-lg font-semibold">
                      moneee
                    </SheetTitle>
                  </SheetHeader>
                  {renderNavItems({ inSheet: true })}
                  <Separator />
                  <div className="space-y-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Active plan
                    </p>
                    <Select
                      value={currentPlanValue}
                      onValueChange={(value) => {
                        setActivePlan(value);
                      }}
                    >
                      <SelectTrigger aria-label="Active plan">
                        <SelectValue placeholder="Choose plan" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(plans).map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button className="w-full" onClick={handleNewPlan}>
                      <Plus className="mr-2 h-4 w-4" aria-hidden />
                      New plan
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
              <Link
                href="/"
                className="flex items-center gap-2 text-base font-semibold tracking-tight sm:text-lg"
              >
                <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-semibold uppercase text-primary">
                  Beta
                </span>
                moneee
              </Link>
            </div>
            <div className="hidden flex-1 md:flex md:justify-center">
              {renderNavItems()}
            </div>
            <div className="flex items-center gap-2">
              <div className="flex md:hidden">
                <Select
                  value={currentPlanValue}
                  onValueChange={(value) => setActivePlan(value)}
                >
                  <SelectTrigger
                    className="h-9 w-[150px]"
                    aria-label="Active plan"
                  >
                    <SelectValue placeholder="Choose plan" />
                  </SelectTrigger>
                  <SelectContent align="end">
                    {Object.values(plans).map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="hidden flex-col items-end md:flex">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {/* Active plan */}
                </span>
                <Select
                  value={currentPlanValue}
                  onValueChange={(value) => setActivePlan(value)}
                >
                  <SelectTrigger
                    className="h-9 w-[200px]"
                    aria-label="Active plan"
                  >
                    <SelectValue placeholder="Choose plan" />
                  </SelectTrigger>
                  <SelectContent align="end">
                    {Object.values(plans).map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="hidden md:inline-flex"
                onClick={handleNewPlan}
              >
                <Plus className="mr-2 h-4 w-4" aria-hidden />
                New plan
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </header>
        <main
          id="main-content"
          className="mx-auto w-full max-w-6xl flex-1 px-4 pb-24 pt-6 sm:pt-8"
        >
          <div className="space-y-6 sm:space-y-8">
            {settings.showRealityCheck && realityCheck && plan && (
              <RealityCheckChip
                realityCheck={realityCheck}
                currency={plan.currency}
                locale={settings.locale}
              />
            )}
            {warnings.length > 0 && <PlanWarnings warnings={warnings} />}
            {children}
          </div>
        </main>
        {plan && summary && (
          <SummaryBar
            summary={summary}
            currency={plan.currency || settings.currency}
            locale={settings.locale}
          />
        )}
        <footer className="border-t border-border/70 bg-muted/40 py-5 text-xs text-muted-foreground sm:text-sm">
          <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4" aria-hidden />
              <span>
                Offline-first. No trackers. Your data stays on this device.
              </span>
            </div>
            <Button
              variant="link"
              className="px-0 text-xs font-medium sm:text-sm"
              onClick={deleteAllData}
            >
              Delete all data
            </Button>
          </div>
        </footer>
      </div>
    </PasscodeGate>
  );
}
