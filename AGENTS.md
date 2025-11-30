# Repository Guidelines

## Project Structure & Module Organization
Code lives in `my-app/`. App Router routes sit in `src/app`, pairing `page.tsx` with optional `layout.tsx`, `loading.tsx`, or boundary files. Shared atoms stay in `src/components`, while `src/features/<domain>` groups feature logic end to end. Hooks, utilities, stores, and DTOs belong in `src/hooks`, `src/utils`, `src/stores`, and `src/types`, with configuration and typed env exports in `src/config`. Test doubles live in `src/testing`, static assets in `public/`, and global styles in `src/app/globals.css`.

## Build, Test, and Development Commands
- `pnpm install` - sync dependencies; pnpm keeps `pnpm-lock.yaml` canonical.
- `pnpm dev` - Next.js dev server on `http://localhost:3000` with fast refresh.
- `pnpm build` - type-check and emit the optimized bundle; run before pushing.
- `pnpm start` - serve `.next` for production-like smoke tests.
- `pnpm lint` - ESLint core-web-vitals profile; fix or justify every warning.
- `pnpm vitest run` - add this script when introducing automated tests; document manual QA until it exists.

## Coding Style & Naming Conventions
Project code is ESM TypeScript with 2-space indentation (see `src/app/page.tsx`). Components use `PascalCase`, hooks `useCamelCase`, and files stay lowercase-hyphen (`hero-section.tsx`). Export shared models from `src/types` and route environment lookups through a single helper such as `src/config/env.ts`. Styling defaults to Tailwind utility stacks, so avoid inline styles and favor semantic class groupings or extracted variants.

## Testing Guidelines
Default stack is Vitest plus React Testing Library once tests land; stash helpers and mocks inside `src/testing`. Co-locate specs as `<subject>.test.tsx` (or `.test.ts`) beside their targets and cover critical light and dark mode states for UI widgets. Target roughly 80% branch coverage on touched modules. Until a `test` script is checked in, record browsers, devices, and manual QA steps in each PR.

## Commit & Pull Request Guidelines
Follow Conventional Commits (`feat: hero animation`, `fix: nav focus`); keep subjects <=72 characters and describe behavior changes in the body. Keep PRs narrow (~400 LOC), link the tracking issue, and include screenshots or recordings for UI updates. List every verification command (`pnpm lint`, `pnpm build`, any ad-hoc tests) in the PR description. Re-request reviews after force pushes.

## Security & Configuration Tips
Store secrets in `.env.local`, never in Git, and prefix browser-exposed values with `NEXT_PUBLIC_`. Mirror new env keys inside `src/config` so components rely on typed helpers instead of raw `process.env` calls. Test feature flags or config toggles in both development (`pnpm dev`) and production (`pnpm start`) modes to avoid hydration drift.
