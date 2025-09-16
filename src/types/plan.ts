export type IncomeFrequency = "monthly" | "bi-weekly" | "weekly"

export interface IncomeInput {
  amount: number
  frequency: IncomeFrequency
}

export type CategoryType = "fixed" | "variable" | "sinking" | "envelope"

export type BudgetBucket = "needs" | "wants" | "savings"

export interface CategoryBase {
  id: string
  name: string
  type: CategoryType
  bucket: BudgetBucket
  amountMonthly: number
  capMonthly?: number
}

export interface SinkingFund extends CategoryBase {
  type: "sinking"
  target: number
  dueDate: string
}

export type Category = CategoryBase | SinkingFund

export interface Debt {
  id: string
  name: string
  balance: number
  apr: number
  minimum: number
}

export interface Goal {
  id: string
  name: string
  target: number
  current: number
  dueDate?: string
}

export interface MethodPreset {
  id: string
  name: string
  needsPct: number
  wantsPct: number
  savingsPct: number
}

export interface PlanMeta {
  createdAt: string
  updatedAt: string
}

export interface PlanIncome {
  primary: IncomeInput
  extras?: IncomeInput[]
}

export interface Plan {
  id: string
  name: string
  currency: string
  income: PlanIncome
  categories: Category[]
  debts: Debt[]
  goals: Goal[]
  methodPresetId?: string
  methodMode: "preset" | "zero" | "envelope"
  meta: PlanMeta
}

export interface Scenario {
  id: string
  name: string
  basePlanId: string
  plan: Plan
  createdAt: string
  updatedAt: string
}
