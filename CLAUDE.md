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

- `npm run seed*` / `npm run set-admin <email>` / `npm run normalize-emails` / `npm run reset-ratings-and-sales` — one-off scripts in `scripts/`; they load `.env.local`, so they hit the dev database unless `MONGODB_DB` is set in the shell

Tests are unit tests for pure logic in `src/lib/*.ts` (colocated as `*.test.ts`) — no database or browser involved (`db.test.ts` mocks mongoose). CI (`.github/workflows/ci.yml`) runs lint and tests. After adding a route, run `npx next typegen` (or `dev`/`build`) before `tsc`, since `PageProps<"/route">` types are generated.

Before calling a change done, run `npm run lint` and `npm test` locally (and `npm run build` when routes, types or config changed) — don't leave failures for CI to find.

## Git workflow

Vercel deploys `master` straight to the live site, so never commit or push to `master` directly.

- `git fetch origin`, then branch from `origin/master` (not the local `master`, which may be stale).
- Push the branch → check its Vercel Preview → open a PR; the user merges it on GitHub.
- Local dev and Preview use the `sk-supplement-dev` database; Production uses `sk-supplement`.

## Environment variables

Set in `.env.local` (locally) and in Vercel. Never commit their values.

- `MONGODB_URI`, `MONGODB_DB` — database connection and name (see Architecture)
- `SESSION_SECRET` — signs the JWT session cookie (`src/lib/auth.ts`)
- `ZARINPAL_MERCHANT_ID`, `ZARINPAL_SANDBOX` — gateway credentials; sandbox is on unless set to `"false"`
- `CARD_NUMBER`, `CARD_HOLDER`, `CARD_BANK` — the card shown for card-to-card payment (`src/lib/cardPayment.ts`)
- `NEXT_PUBLIC_SITE_URL` — public site URL (`src/lib/site.ts`)
- `NEXT_PUBLIC_SALES_OPEN` — `"true"` opens the shop; unset, prices show «به زودی» and cart/checkout/payment APIs are closed (`src/lib/sales.ts`). Inlined at build time, so redeploy after changing it

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
- Prices are stored and shown in Toman; ZarinPal takes Rial, converted only inside `src/lib/zarinpal.ts`.

API route handlers (`src/app/api/**/route.ts`):

- Check access first: `getSessionAdmin()` in `api/admin/`, `getSessionUser()` where the data belongs to a customer.
- Treat input as untrusted. Read the body with `await request.json().catch(() => null)`, validate it (prefer a zod schema in `src/lib/`), and check `_id` params with `isValidObjectId` before querying — bad input must get a 4xx, never a 500.
- Errors are `Response.json({ message: "…" }, { status })` with a Persian message and a fitting status (400 invalid, 401 not logged in, 404 not found, 409 conflict, 429 rate-limited).
- Use the existing helpers: `escapeRegex` for user text inside `$regex`, `getSafeRedirectPath` for `?next=`-style redirects, `toSetAndUnset` (`src/lib/mongoUpdate.ts`) for partial updates that may clear fields.

Models: documents already in the database won't have a newly added field, so make it optional (or write a migration script in `scripts/`). Then update everything that writes it — the admin form, the API validation and the seed scripts.

## UI conventions

- Components live in `src/components/<area>/<Name>/index.tsx`.
- Components are Server Components by default; add `"use client"` only when they need state, effects, event handlers or browser APIs.
- Dark mode is class-based (`.dark` on `<html>`, `@custom-variant dark` in `src/app/globals.css`). Give new UI `dark:` colors and check it in both themes.
- RTL: in new or edited UI, prefer logical Tailwind utilities (`ms-*`/`me-*`, `ps-*`/`pe-*`, `start-*`/`end-*`, `text-start`) over `ml-*`/`mr-*`, `left-*`/`right-*`, so spacing follows the reading direction.
- Format numbers and prices for display with `toLocaleString("fa-IR")` (Persian digits), e.g. `{price.toLocaleString("fa-IR")} تومان`.
- User-facing text is in Persian.

## Working with this user

- The user is learning web development and wrote this project themselves.
- Whenever you make a change, explain it fully and in detail: what you changed, why, and what concept or standard it relates to. Do not just make the edit silently.
- Write clean, standard, idiomatic code (consistent with Next.js/React/TypeScript conventions and this repo's ESLint config).
