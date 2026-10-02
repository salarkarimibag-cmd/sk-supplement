# SK Supplement

An online store for sports supplements, built with Next.js (App Router), TypeScript, Tailwind CSS v4, and MongoDB via Mongoose. The storefront is in Persian (RTL).

## Tech stack

- **Framework:** Next.js 16 (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS v4
- **Database:** MongoDB (via Mongoose) — Atlas or any MongoDB instance
- **Auth:** Session cookies signed with `jose` (JWT), passwords hashed with `bcryptjs`
- **Payments:** ZarinPal
- **Forms:** `react-hook-form` + `zod` (customer-facing forms only; admin forms use plain controlled state)

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

| Variable | Description |
| --- | --- |
| `MONGODB_URI` | Connection string from MongoDB Atlas (Atlas → Connect → Drivers), or any MongoDB instance. |
| `SESSION_SECRET` | Signs login session cookies. Generate one with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `ZARINPAL_MERCHANT_ID` | Your ZarinPal merchant id. Leave empty to see a clear "not configured" error instead of a silent failure. |
| `ZARINPAL_SANDBOX` | `true` (default) hits ZarinPal's sandbox — safe for testing, no real money moves. Set to `false` once you have a real merchant id to go live. |
| `NEXT_PUBLIC_SITE_URL` | Used for SEO metadata (sitemap, robots.txt, canonical/Open Graph URLs). Use `http://localhost:3000` in development; set to the real domain once one exists. |

### 3. Seed the database

Run these once against a fresh database (each is safe to re-run — they upsert, not duplicate):

```bash
npm run seed              # products
npm run seed:more-products # a few extra products (creatine/health-wellness/vitamins)
npm run seed:categories   # category content (title, description, banner)
npm run seed:blogs        # blog posts
npm run seed:discounts    # discount codes (WELCOME10, SK50000)
npm run seed:reviews      # a few sample (already-approved) customer reviews
```

### 4. Create an admin account

Register a normal account through `/account/register`, then promote it to admin:

```bash
npm run set-admin -- you@example.com
```

Admin-only pages (`/admin/products`, `/admin/discounts`) require logging in with that account. If you were already logged in when you ran this, log out and back in.

### 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Run the production build |
| `npm run lint` | Lint with ESLint |
| `npm test` | Run the Vitest unit test suite once |
| `npm run test:watch` | Run Vitest in watch mode |
| `npm run seed` | Seed products |
| `npm run seed:more-products` | Seed extra products (creatine/health-wellness/vitamins) |
| `npm run seed:categories` | Seed category content |
| `npm run seed:blogs` | Seed blog posts |
| `npm run seed:discounts` | Seed discount codes |
| `npm run seed:reviews` | Seed sample approved customer reviews |
| `npm run set-admin -- <email>` | Promote a registered user to admin |

## Testing

Unit tests (Vitest) cover pure logic in `src/lib/*.ts` — things like discount calculation, product sorting/filtering, and IP parsing — colocated as `*.test.ts` next to the code they test. No database, server, or browser is involved. There's no end-to-end or component test coverage yet.

## Notes

- Contact form submissions and newsletter signups can be viewed and deleted at `/admin/messages` and `/admin/subscribers`, but nothing sends an email/SMS notification when a new one comes in yet.
- Product images are plain paths into `/public/images/` (e.g. `/images/whey.webp`) — there's no file upload; the admin product form takes a text field for the image path.
- Before going live: set `ZARINPAL_SANDBOX=false` with a real merchant id, and update `NEXT_PUBLIC_SITE_URL` to the real domain.
- Customer reviews are moderated at `/admin/reviews`. Unapproved reviews are automatically deleted 30 days after submission (a MongoDB TTL index on `Review.createdAt`) so a stale/unmoderated queue doesn't pile up — approved reviews are kept indefinitely.
