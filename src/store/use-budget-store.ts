"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { DEFAULT_METHOD_PRESETS } from "@/lib/presets";
import { createId } from "@/lib/id";
import type {
  Category,
  Debt,
  Goal,
  MethodPreset,
  Plan,
  Scenario,
  SettingsState,
} from "@/types";

function nowIso() {
  return new Date().toISOString();
}

function clonePlan(plan: Plan): Plan {
  return JSON.parse(JSON.stringify(plan));
}

function createDefaultPlan(): Plan {
  const preset = DEFAULT_METHOD_PRESETS[0];
  const timestamp = nowIso();
  return {
    id: createId("plan"),
    name: "Main plan",
    currency: "LKR",
    income: {
      primary: {
        amount: 0,
        frequency: "monthly",
      },
    },
    categories: [],
    debts: [],
    goals: [],
    methodPresetId: preset?.id,
    methodMode: "preset",
    meta: {
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  };
}

export interface SettingsSlice {
  settings: SettingsState;
  setSettings: (settings: Partial<SettingsState>) => void;
  setActivePlan: (planId: string) => void;
  toggleRealityCheck: () => void;
  setPasscode: (passcode?: string) => void;
}

export interface PlanSlice {
  plans: Record<string, Plan>;
  presets: MethodPreset[];
  createPlan: (name?: string) => string;
  updatePlan: (planId: string, updater: (plan: Plan) => Plan) => void;
  deletePlan: (planId: string) => void;
  duplicatePlan: (planId: string, name?: string) => string | undefined;
  upsertCategory: (planId: string, category: Category) => void;
  removeCategory: (planId: string, categoryId: string) => void;
  reorderCategories: (planId: string, orderedIds: string[]) => void;
  upsertDebt: (planId: string, debt: Debt) => void;
  removeDebt: (planId: string, debtId: string) => void;
  upsertGoal: (planId: string, goal: Goal) => void;
  removeGoal: (planId: string, goalId: string) => void;
  setMethodMode: (planId: string, mode: Plan["methodMode"]) => void;
  setMethodPreset: (planId: string, presetId: string) => void;
  addPreset: (preset: MethodPreset) => void;
  updatePreset: (preset: MethodPreset) => void;
  removePreset: (presetId: string) => void;
}

export interface ScenarioSlice {
  scenarios: Record<string, Scenario>;
  createScenario: (planId: string, name?: string) => string | undefined;
  updateScenario: (
    scenarioId: string,
    updater: (scenario: Scenario) => Scenario
  ) => void;
  deleteScenario: (scenarioId: string) => void;
}

export interface MetaSlice {
  deleteAllData: () => void;
}

export type BudgetStore = SettingsSlice & PlanSlice & ScenarioSlice & MetaSlice;

const defaultPlan = createDefaultPlan();
const defaultSettings: SettingsState = {
  activePlanId: defaultPlan.id,
  currency: "LKR",
  locale: "en-LK",
  theme: "system",
  enablePasscode: false,
  showRealityCheck: true,
};

const initialState: Pick<
  BudgetStore,
  "settings" | "plans" | "presets" | "scenarios"
> = {
  settings: defaultSettings,
  plans: {
    [defaultPlan.id]: defaultPlan,
  },
  presets: [...DEFAULT_METHOD_PRESETS],
  scenarios: {},
};

export const useBudgetStore = create<BudgetStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      deleteAllData: () => {
        const freshPlan = createDefaultPlan();
        set({
          settings: { ...defaultSettings, activePlanId: freshPlan.id },
          plans: { [freshPlan.id]: freshPlan },
          presets: [...DEFAULT_METHOD_PRESETS],
          scenarios: {},
        });
      },
      setSettings: (settings) =>
        set((state) => ({
          settings: {
            ...state.settings,
            ...settings,
          },
        })),
      setActivePlan: (planId) =>
        set((state) => ({
          settings: {
            ...state.settings,
            activePlanId: state.plans[planId]
              ? planId
              : state.settings.activePlanId,
          },
        })),
      toggleRealityCheck: () =>
        set((state) => ({
          settings: {
            ...state.settings,
            showRealityCheck: !state.settings.showRealityCheck,
          },
        })),
      setPasscode: (passcode) =>
        set((state) => ({
          settings: {
            ...state.settings,
            enablePasscode: Boolean(passcode),
            passcode,
          },
        })),
      createPlan: (name) => {
        const id = createId("plan");
        const timestamp = nowIso();
        const preset = get().presets[0] ?? DEFAULT_METHOD_PRESETS[0];
        const plan: Plan = {
          id,
          name: name || "New plan",
          currency: defaultSettings.currency,
          income: {
            primary: {
              amount: 0,
              frequency: "monthly",
            },
          },
          categories: [],
          debts: [],
          goals: [],
          methodPresetId: preset?.id,
          methodMode: "preset",
          meta: {
            createdAt: timestamp,
            updatedAt: timestamp,
          },
        };
        set((state) => ({
          plans: { ...state.plans, [id]: plan },
          settings: { ...state.settings, activePlanId: id },
        }));
        return id;
      },
      updatePlan: (planId, updater) =>
        set((state) => {
          const existing = state.plans[planId];
          if (!existing) return state;
          const updated = updater({
            ...existing,
            categories: [...existing.categories],
            debts: [...existing.debts],
            goals: [...existing.goals],
          });
          updated.meta = {
            ...existing.meta,
            ...updated.meta,
            updatedAt: nowIso(),
          };
          return {
            plans: {
              ...state.plans,
              [planId]: updated,
            },
          };
        }),
      deletePlan: (planId) =>
        set((state) => {
          if (!state.plans[planId]) return state;
          const rest = { ...state.plans };
          delete rest[planId];
          const remainingIds = Object.keys(rest);
          const nextActive =
            state.settings.activePlanId === planId
              ? remainingIds[0]
              : state.settings.activePlanId;
          return {
            plans: rest,
            settings: {
              ...state.settings,
              activePlanId: nextActive,
            },
          };
        }),
      duplicatePlan: (planId, name) => {
        const plan = get().plans[planId];
        if (!plan) return undefined;
        const copy = clonePlan(plan);
        const id = createId("plan");
        const timestamp = nowIso();
        copy.id = id;
        copy.name = name || `${plan.name} copy`;
        copy.meta = {
          createdAt: timestamp,
          updatedAt: timestamp,
        };
        set((state) => ({
          plans: { ...state.plans, [id]: copy },
        }));
        return id;
      },
      upsertCategory: (planId, category) =>
        get().updatePlan(planId, (plan) => {
          const index = plan.categories.findIndex(
            (item) => item.id === category.id
          );
          const categories = [...plan.categories];
          if (index >= 0) {
            categories[index] = { ...categories[index], ...category };
          } else {
            categories.push(category);
          }
          return { ...plan, categories };
        }),
      removeCategory: (planId, categoryId) =>
        get().updatePlan(planId, (plan) => ({
          ...plan,
          categories: plan.categories.filter(
            (category) => category.id !== categoryId
          ),
        })),
      reorderCategories: (planId, orderedIds) =>
        get().updatePlan(planId, (plan) => {
          const orderMap = new Map(orderedIds.map((id, index) => [id, index]));
          const categories = [...plan.categories].sort((a, b) => {
            const aIndex = orderMap.get(a.id) ?? Infinity;
            const bIndex = orderMap.get(b.id) ?? Infinity;
            return aIndex - bIndex;
          });
          return { ...plan, categories };
        }),
      upsertDebt: (planId, debt) =>
        get().updatePlan(planId, (plan) => {
          const debts = [...plan.debts];
          const index = debts.findIndex((item) => item.id === debt.id);
          if (index >= 0) {
            debts[index] = { ...debts[index], ...debt };
          } else {
            debts.push(debt);
          }
          return { ...plan, debts };
        }),
      removeDebt: (planId, debtId) =>
        get().updatePlan(planId, (plan) => ({
          ...plan,
          debts: plan.debts.filter((debt) => debt.id !== debtId),
        })),
      upsertGoal: (planId, goal) =>
        get().updatePlan(planId, (plan) => {
          const goals = [...plan.goals];
          const index = goals.findIndex((item) => item.id === goal.id);
          if (index >= 0) {
            goals[index] = { ...goals[index], ...goal };
          } else {
            goals.push(goal);
          }
          return { ...plan, goals };
        }),
      removeGoal: (planId, goalId) =>
        get().updatePlan(planId, (plan) => ({
          ...plan,
          goals: plan.goals.filter((goal) => goal.id !== goalId),
        })),
      setMethodMode: (planId, mode) =>
        get().updatePlan(planId, (plan) => ({
          ...plan,
          methodMode: mode,
        })),
      setMethodPreset: (planId, presetId) =>
        get().updatePlan(planId, (plan) => ({
          ...plan,
          methodPresetId: presetId,
        })),
      addPreset: (preset) =>
        set((state) => ({
          presets: [...state.presets, preset],
        })),
      updatePreset: (preset) =>
        set((state) => ({
          presets: state.presets.map((item) =>
            item.id === preset.id ? { ...item, ...preset } : item
          ),
        })),
      removePreset: (presetId) =>
        set((state) => ({
          presets: state.presets.filter((preset) => preset.id !== presetId),
        })),
      scenarios: {},
      createScenario: (planId, name) => {
        const plan = get().plans[planId];
        if (!plan) return undefined;
        const id = createId("scenario");
        const timestamp = nowIso();
        const scenario: Scenario = {
          id,
          name: name || `${plan.name} tweak`,
          basePlanId: planId,
          plan: clonePlan(plan),
          createdAt: timestamp,
          updatedAt: timestamp,
        };
        set((state) => ({
          scenarios: { ...state.scenarios, [id]: scenario },
        }));
        return id;
      },
      updateScenario: (scenarioId, updater) =>
        set((state) => {
          const scenario = state.scenarios[scenarioId];
          if (!scenario) return state;
          const updated = updater({
            ...scenario,
            plan: clonePlan(scenario.plan),
          });
          updated.updatedAt = nowIso();
          return {
            scenarios: {
              ...state.scenarios,
              [scenarioId]: updated,
            },
          };
        }),
      deleteScenario: (scenarioId) =>
        set((state) => {
          if (!state.scenarios[scenarioId]) return state;
          const rest = { ...state.scenarios };
          delete rest[scenarioId];
          return { scenarios: rest };
        }),
    }),
    {
      name: "moneee-budget-store",
      storage: createJSONStorage(() =>
        typeof window === "undefined"
          ? {
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {},
            }
          : window.localStorage
      ),
      partialize: (state) => ({
        settings: state.settings,
        plans: state.plans,
        presets: state.presets,
        scenarios: state.scenarios,
      }),
    }
  )
);
