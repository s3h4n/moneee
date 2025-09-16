import { differenceInCalendarMonths, parseISO } from "date-fns";
import type {
  Category,
  Debt,
  IncomeFrequency,
  MethodPreset,
  Plan,
  BudgetBucket,
} from "@/types";

const PERIODS_PER_YEAR: Record<IncomeFrequency, number> = {
  monthly: 12,
  "bi-weekly": 26,
  weekly: 52,
};

export function normaliseToMonthly(amount: number, frequency: IncomeFrequency) {
  return (amount * PERIODS_PER_YEAR[frequency]) / 12;
}

export function percentTargets(
  incomeMonthly: number,
  preset: Pick<MethodPreset, "needsPct" | "wantsPct" | "savingsPct">
) {
  return {
    needs: incomeMonthly * preset.needsPct,
    wants: incomeMonthly * preset.wantsPct,
    savings: incomeMonthly * preset.savingsPct,
  };
}

export function sinkingMonthly(
  target: number,
  isoDueDate: string,
  now = new Date()
) {
  const due = parseISO(isoDueDate);
  const monthsRemaining = Math.max(differenceInCalendarMonths(due, now), 0) + 1;
  if (monthsRemaining <= 1) {
    return target;
  }
  return target / monthsRemaining;
}

export function formatCurrency(
  value: number,
  locale: string,
  currency: string
) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function resolveCategoryAmount(category: Category, now = new Date()) {
  if (
    category.type === "sinking" &&
    "target" in category &&
    "dueDate" in category
  ) {
    const auto = sinkingMonthly(category.target, category.dueDate, now);
    return category.amountMonthly || auto;
  }
  return category.amountMonthly;
}

export interface PlanSummary {
  income: number;
  needs: number;
  wants: number;
  savings: number;
  debt: number;
  leftover: number;
}

export type PlanWarningType =
  | "overspend"
  | "negative-leftover"
  | "underfunded-goals";

export interface PlanWarning {
  type: PlanWarningType;
  message: string;
}

export function calculateIncomeMonthly(plan: Plan) {
  const base = normaliseToMonthly(
    plan.income.primary.amount,
    plan.income.primary.frequency
  );
  const extras =
    plan.income.extras
      ?.map((income) => normaliseToMonthly(income.amount, income.frequency))
      .reduce((sum, value) => sum + value, 0) ?? 0;
  return base + extras;
}

export function sumByBucket(
  plan: Plan,
  bucket: BudgetBucket,
  now = new Date()
) {
  return plan.categories
    .filter((category) => category.bucket === bucket)
    .reduce(
      (total, category) => total + resolveCategoryAmount(category, now),
      0
    );
}

export function calculatePlanSummary(
  plan: Plan,
  now = new Date()
): PlanSummary {
  const income = calculateIncomeMonthly(plan);
  const needs = sumByBucket(plan, "needs", now);
  const wants = sumByBucket(plan, "wants", now);
  const savings = sumByBucket(plan, "savings", now);
  const debt = plan.debts.reduce(
    (total, debtItem) => total + debtItem.minimum,
    0
  );
  const leftover = income - (needs + wants + savings + debt);

  return { income, needs, wants, savings, debt, leftover };
}

function monthsUntil(dateIso: string, now = new Date()) {
  return Math.max(differenceInCalendarMonths(parseISO(dateIso), now), 0) + 1;
}

export function evaluatePlanWarnings(
  plan: Plan,
  now = new Date()
): PlanWarning[] {
  const summary = calculatePlanSummary(plan, now);
  const warnings: PlanWarning[] = [];

  if (
    summary.needs + summary.wants + summary.savings + summary.debt >
    summary.income
  ) {
    warnings.push({
      type: "overspend",
      message: "Your allocations are higher than your monthly income.",
    });
  }

  if (summary.leftover < 0) {
    warnings.push({
      type: "negative-leftover",
      message:
        "Your plan leaves no room for leftover cash. Adjust allocations until leftover is zero or positive.",
    });
  }

  const monthlyGoalNeed = plan.goals.reduce((total, goal) => {
    if (!goal.dueDate) {
      return total;
    }
    const months = monthsUntil(goal.dueDate, now);
    const remaining = Math.max(goal.target - goal.current, 0);
    if (months <= 0 || remaining <= 0) {
      return total;
    }
    return total + remaining / months;
  }, 0);

  if (monthlyGoalNeed > 0 && monthlyGoalNeed > summary.savings) {
    warnings.push({
      type: "underfunded-goals",
      message:
        "Savings goals need more monthly allocation to hit targets on time.",
    });
  }

  return warnings;
}

export interface RealityCheck {
  income: number;
  needsDelta: number;
  wantsDelta: number;
  savingsDelta: number;
}

export function computeRealityCheck(
  income: number,
  allocations: Pick<PlanSummary, "needs" | "wants" | "savings">,
  preset: Pick<MethodPreset, "needsPct" | "wantsPct" | "savingsPct">
): RealityCheck {
  const targets = percentTargets(income, preset);
  return {
    income,
    needsDelta: allocations.needs - targets.needs,
    wantsDelta: allocations.wants - targets.wants,
    savingsDelta: allocations.savings - targets.savings,
  };
}

export interface DebtPayoffStep {
  debtId: string;
  name: string;
  months: number;
  interestPaid: number;
  totalPaid: number;
}

export interface DebtPayoffSummary {
  strategy: "snowball" | "avalanche";
  steps: DebtPayoffStep[];
  totalInterest: number;
  monthsToDebtFree: number;
  insufficientBudget: boolean;
}

function sortDebts(debts: Debt[], strategy: "snowball" | "avalanche") {
  const sorted = [...debts];
  if (strategy === "snowball") {
    sorted.sort((a, b) => a.balance - b.balance);
  } else {
    sorted.sort((a, b) => b.apr - a.apr);
  }
  return sorted;
}

export function projectDebtPayoff(
  debts: Debt[],
  monthlyBudget: number,
  strategy: "snowball" | "avalanche"
): DebtPayoffSummary {
  const minimums = debts.reduce((sum, debt) => sum + debt.minimum, 0);
  if (debts.length === 0) {
    return {
      strategy,
      steps: [],
      totalInterest: 0,
      monthsToDebtFree: 0,
      insufficientBudget: false,
    };
  }

  if (monthlyBudget < minimums) {
    return {
      strategy,
      steps: debts.map((debt) => ({
        debtId: debt.id,
        name: debt.name,
        months: Infinity,
        interestPaid: Infinity,
        totalPaid: Infinity,
      })),
      totalInterest: Infinity,
      monthsToDebtFree: Infinity,
      insufficientBudget: true,
    };
  }

  const order = sortDebts(debts, strategy);
  const ledger = order.map((debt) => ({
    ...debt,
    balance: debt.balance,
    interestPaid: 0,
    totalPaid: 0,
  }));
  const steps: DebtPayoffStep[] = [];
  let months = 0;
  let totalInterest = 0;

  const maxMonths = 600;
  while (ledger.some((debt) => debt.balance > 0) && months < maxMonths) {
    months += 1;
    const extraPool = monthlyBudget - minimums;

    ledger.forEach((debt, index) => {
      if (debt.balance <= 0) {
        return;
      }
      const monthlyRate = debt.apr / 100 / 12;
      const interest = debt.balance * monthlyRate;
      debt.balance += interest;
      debt.interestPaid += interest;
      totalInterest += interest;

      let payment = debt.minimum;
      const isFocused = ledger
        .slice(0, index)
        .every((prior) => prior.balance <= 0);

      if (isFocused && extraPool > 0) {
        payment += extraPool;
      }

      debt.balance -= payment;
      debt.totalPaid += payment;
      if (debt.balance < 0) {
        debt.totalPaid += debt.balance;
        debt.balance = 0;
      }
    });
  }

  ledger.forEach((debt) => {
    const monthsToClear = Math.max(
      Math.ceil(debt.totalPaid / Math.max(debt.minimum, 1)),
      1
    );
    steps.push({
      debtId: debt.id,
      name: debt.name,
      months: debt.balance === 0 ? monthsToClear : Infinity,
      interestPaid: Number(debt.interestPaid.toFixed(2)),
      totalPaid: Number(debt.totalPaid.toFixed(2)),
    });
  });

  const allCleared = ledger.every((debt) => debt.balance === 0);

  return {
    strategy,
    steps,
    totalInterest: Number(totalInterest.toFixed(2)),
    monthsToDebtFree: allCleared ? months : Infinity,
    insufficientBudget: !allCleared,
  };
}

export function snowball(debts: Debt[], monthlyBudget: number) {
  return projectDebtPayoff(debts, monthlyBudget, "snowball");
}

export function avalanche(debts: Debt[], monthlyBudget: number) {
  return projectDebtPayoff(debts, monthlyBudget, "avalanche");
}
