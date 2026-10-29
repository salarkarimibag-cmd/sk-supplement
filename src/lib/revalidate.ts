import { revalidatePath } from "next/cache";

// Pages without request-time data (the home page, /pages/*, /blogs, …) are
// prerendered and refreshed on a timer (see `revalidate` in the root layout
// and home page). An admin change shouldn't wait for that timer, so the
// routes that make one call these after a successful write.

/**
 * A product was added, edited or removed: every prerendered page, since the
 * header menu lists the brands and the home page lists products.
 */
export function revalidateCatalog(): void {
  revalidatePath("/", "layout");
}

/** A discount code or review changed: the home page's hero offer and testimonials. */
export function revalidateHome(): void {
  revalidatePath("/");
}
