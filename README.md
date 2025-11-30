# Evise Portfolio

A Next.js 16 App Router experience that showcases my design, motion, and engineering chops through tightly curated sections (About, tree-based storytelling cards, and motion studies) plus a growing set of interactive experiments such as the motion visualizer and typing tracker.

## Repository layout
- `my-app/` – the Next.js project with all source, assets, and build scripts
- `AGENTS.md` – harness/co-pilot instructions for collaborators
- `.gitignore` – shared ignore rules for frontend tooling, IDEs, and local env secrets

## Getting started
```bash
cd my-app
pnpm install
pnpm dev
```
This launches the dev server on `http://localhost:3000` with fast refresh. Keep Tailwind CLI (Next handles it) running alongside for instant style updates.

## Useful scripts
- `pnpm dev` – start the local dev server
- `pnpm lint` – run ESLint (core-web-vitals rules)
- `pnpm build` – create the production bundle and type-check
- `pnpm start` – serve the `.next` output for smoke tests after `pnpm build`

## Environment variables
No secrets are required yet. When you add any, place them in `my-app/.env.local` (or another `.env.*` file) and mirror the types through `src/config` so components never touch `process.env` directly. `.gitignore` already protects these files from accidental commits; keep shareable defaults in an optional `my-app/.env.example`.

## Deployment
1. Run `pnpm build` to produce the `.next` output.
2. Deploy via Vercel or any Node 18+ host by running `pnpm start` (after copying the `.next` folder) or by connecting the GitHub repo to Vercel for zero-config builds.
3. Smoke-test the deployed build, focusing on scroll snapping, motion visualizer interactions, and experiment widgets in both light/dark modes if toggles exist.

## Roadmap ideas
- Add Vitest + React Testing Library for regression coverage on shared components.
- Document the design system tokens (colors, typography scales) under `src/config`.
- Expand the experiments section with lazy-loaded routes to keep the hero bundle lean.
