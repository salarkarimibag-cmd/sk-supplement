# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

- `npm run dev` — start the dev server (http://localhost:3000)
- `npm run build` — production build
- `npm run start` — run the production build
- `npm run lint` — lint with ESLint (flat config in `eslint.config.mjs`, extends `eslint-config-next`)
- `npm test` — run the Vitest unit test suite once
- `npm run test:watch` — run Vitest in watch mode

- `npm run seed*` / `npm run set-admin <email>` / `npm run normalize-emails` — one-off scripts in `scripts/`; they load `.env.local`, so they hit the dev database unless `MONGODB_DB` is set in the shell

Tests are unit tests for pure logic in `src/lib/*.ts` (colocated as `*.test.ts`) — no database or browser involved (`db.test.ts` mocks mongoose). CI (`.github/workflows/ci.yml`) runs lint and tests. After adding a route, run `npx next typegen` (or `dev`/`build`) before `tsc`, since `PageProps<"/route">` types are generated.

## Architecture

SK Supplement — a Persian (RTL, `lang="fa"`) online supplement store. Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, MongoDB via Mongoose, zod for validation. Path alias `@/*` maps to `./src/*`.

- `src/app/` — pages and route handlers (`api/`). `admin/` and `api/admin/` are gated by `getSessionAdmin()` (`src/lib/auth.ts`, JWT session cookie via `jose`).
- `src/models/` — Mongoose schemas (Product, Order, DiscountCode, User, …). `src/lib/db.ts` caches the connection; `MONGODB_DB` selects the database (`sk-supplement-dev` for local and Preview, default `sk-supplement` in Production).
- `src/lib/` — server logic and pure helpers. Keep pure logic (pricing, discounts, order status rules, validation schemas) in DB-free modules so it stays unit-testable.

Checkout and money rules (keep these intact):

- The server prices every order: clients send only product ids, quantities and a discount code (`src/lib/orderDraft.ts` → `priceCart`, `checkDiscount`). Never trust prices or totals from the request.
- Payment methods: ZarinPal (`/api/payment` → `/checkout/callback`, `src/lib/zarinpal.ts`) and card-to-card (`/api/payment/card`, admin verifies). Allowed admin status changes per method live in `src/lib/orderStatus.ts`.
- Status changes use a conditional update (filter on the current status) so each transition happens once; side effects (stock, discount usage) run only when that update succeeded, via `onOrderPaid` / `onOrderCancelled` in `src/lib/orderLifecycle.ts`.
- Public forms are rate-limited with `src/lib/rateLimit.ts` (ip + visitor cookie).

## Working with this user

- The user is learning web development and wrote this project themselves.
- Whenever you make a change, explain it fully and in detail: what you changed, why, and what concept or standard it relates to. Do not just make the edit silently.
- Write clean, standard, idiomatic code (consistent with Next.js/React/TypeScript conventions and this repo's ESLint config).
