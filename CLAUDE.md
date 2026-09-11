# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

- `npm run dev` — start the dev server (http://localhost:3000)
- `npm run build` — production build
- `npm run start` — run the production build
- `npm run lint` — lint with ESLint (flat config in `eslint.config.mjs`, extends `eslint-config-next`)

There is no test setup in this repository yet.

## Architecture

This is a stock `create-next-app` scaffold (Next.js 16, App Router, React 19, TypeScript, Tailwind CSS v4) with no custom application code beyond the generated starter page — `app/layout.tsx` and `app/page.tsx`. Path alias `@/*` maps to the repo root (see `tsconfig.json`).

## Working with this user

- The user is learning web development and wrote this project themselves.
- Whenever you make a change, explain it fully and in detail: what you changed, why, and what concept or standard it relates to. Do not just make the edit silently.
- Write clean, standard, idiomatic code (consistent with Next.js/React/TypeScript conventions and this repo's ESLint config).
