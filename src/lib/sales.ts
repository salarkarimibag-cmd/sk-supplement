// Whether the shop is selling yet. Until launch, prices show "به زودی" and
// the cart, checkout and payment APIs are closed. Set
// NEXT_PUBLIC_SALES_OPEN=true (in Vercel, then redeploy) to open the shop.
// Unset means closed, so a missing variable never opens sales by mistake.
// NEXT_PUBLIC_ because client components read it too; Next.js inlines the
// value at build time, which is why changing it needs a new deploy.
export const SALES_OPEN = process.env.NEXT_PUBLIC_SALES_OPEN === "true";

export const COMING_SOON_LABEL = "به زودی";

export const SALES_CLOSED_MESSAGE = "فروش آنلاین به زودی آغاز می‌شود.";
