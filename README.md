# moneee

moneee is a privacy-first budgeting workspace built with Next.js. It keeps every calculation transparent and stores data on the device so you can plan, test scenarios, and export reports without ever creating an account.

## Key Features

- **Plan builder** – Capture income, spending categories, debts, savings goals, and sinking funds with live summaries.
- **Budget methods** – Apply presets such as 50/30/20 or tune custom rules and save them for reuse.
- **Reality checks** – Dashboard highlights leftover cash, warnings, and balance guidance to keep allocations on target.
- **Scenario sandbox** – Duplicate the active plan to run what-if changes and compare deltas before committing.
- **Local-first storage** – All plans, presets, and settings are persisted in the browser via Zustand + localStorage with optional passcode gating.
- **Exports & sharing** – Download JSON/CSV backups or generate print/PDF friendly layouts directly in the browser.
- **Offline ready UI** – Works without a network connection, supports light/dark themes, and uses responsive, accessible components.

## Tech Stack

- [Next.js 15](https://nextjs.org/) with the App Router and Turbopack
- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS v4](https://tailwindcss.com/) with custom design tokens
- [Radix UI](https://www.radix-ui.com/) primitives via shadcn/ui components
- [Zustand](https://zustand-demo.pmnd.rs/) for state management with persistence
- [Zod](https://zod.dev/) & [React Hook Form](https://react-hook-form.com/) for validation and forms
- [date-fns](https://date-fns.org/) and [Recharts](https://recharts.org/) for insights and visualisations

## Getting Started

1. **Install prerequisites**
   - Node.js 18.17 or later (Node 20 LTS recommended)
   - npm (ships with Node). pnpm/bun also work if you prefer, but scripts below assume npm.
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Start the development server**
   ```bash
   npm run dev
   ```
   Open http://localhost:3000 to use the app. Hot module replacement is enabled by Turbopack.
4. **Create a production build**
   ```bash
   npm run build
   npm run start
   ```
   The production server runs on http://localhost:3000 by default.

## Available Scripts

- `npm run dev` – Launches the Next.js development server with Turbopack.
- `npm run build` – Compiles a production build.
- `npm run start` – Starts the production server.
- `npm run lint` – Runs ESLint across the project.
- `npx vitest` – Executes the Vitest test runner (configuration available in `vitest.config.ts`).

## Project Structure

- `src/app` – App Router entries, route layouts, and page-level UI.
- `src/components` – Reusable UI primitives (buttons, dialogs) and budgeting workflows.
- `src/hooks` – Custom hooks for active plan selection, metrics, presets, scenarios, and settings.
- `src/lib` – Utility helpers for IDs, formatting, defaults, and budgeting maths.
- `src/store` – Zustand store slices for plans, scenarios, presets, and persisted settings.
- `src/types` – Shared TypeScript definitions for plans, categories, debts, goals, and UI state.
- `public` – Static assets such as the PWA manifest and icons.

## Data & Privacy

- Plans, scenarios, presets, and preferences are saved locally in the browser using `localStorage`.
- No external APIs or servers receive your budgeting data. Clearing the browser storage (or using the “Delete all data” action inside the app) resets the workspace.
- Optional passcode gating is available inside the Plan builder to keep casual snoops out on shared devices.

## Testing & Quality

- Vitest is configured with a JSDOM environment for component and hook tests. Add specs under `src/` and run them with `npx vitest`.
- ESLint (flat config) enforces coding standards. Tailwind CSS is layered through the app-wide `globals.css` file.

## Deployment

The app is optimised for platforms that support Next.js 15 (Vercel, Netlify, etc.). Set the build command to `npm run build` and the start command to `npm run start`. Since the app is local-first, no additional environment variables are required.

## License

Released under the [MIT License](LICENSE).
