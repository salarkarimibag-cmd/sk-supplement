import type { CatalogProduct } from "@/data/catalog";

/** The stand-in image of a product that has no real photo yet. */
export const PLACEHOLDER_IMAGE = "/images/placeholder.svg";

/** The longest short text shown beside a showcase product, in characters. */
const BLURB_MAX_LENGTH = 110;

/** How many of the maker's claims are shown beside a product. */
const BLURB_MAX_CLAIMS = 3;
/** Longer claims are skipped: they read as small print, not as a highlight. */
const CLAIM_MAX_LENGTH = 70;
/** Legal disclaimers and health-claim boilerplate, which don't make a highlight. */
const LEGAL_CLAIM = /FDA|اتحادیه|ارزیابی|ادعای سلامت|ادعاهای سلامت/;

export interface ShowcaseBlurb {
  /** One highlight per line. */
  lines: string[];
  /** True when they're the maker's own claims, which the page labels as such. */
  fromMaker: boolean;
}

export interface ShowcaseProduct {
  id: string;
  name: string;
  imageUrl: string;
  /** A short line about the product, shown beside its photo. */
  blurb?: ShowcaseBlurb;
}

// Names can carry invisible left-to-right / right-to-left marks, which keep
// the number in "100% Creatine" with its Latin words; they mean nothing once
// the English part is on a line of its own.
const DIRECTION_MARKS = new RegExp(
  `[${String.fromCharCode(0x200e)}${String.fromCharCode(0x200f)}]`,
  "g"
);

/**
 * Splits a name like "مولتی ویتامین آقایان - Opti-Men" at its first " - " into
 * the Persian title and the English name, so the two can sit on separate
 * lines instead of one line that mixes both directions. A name without that
 * separator is returned whole.
 */
export function splitProductName(name: string): { title: string; subtitle?: string } {
  const separator = name.indexOf(" - ");
  if (separator === -1) return { title: name };
  const title = name.slice(0, separator).trim();
  const subtitle = name.slice(separator + 3).replace(DIRECTION_MARKS, "").trim();
  return title && subtitle ? { title, subtitle } : { title: name };
}

/** Cuts text to `max` characters at a word boundary, adding "…" when it did. */
function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > max / 2 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}

/**
 * The highlights shown beside a product's photo: the first few short claims
 * the maker prints on the pack, skipping legal small print (marked
 * `fromMaker`, since the store doesn't vouch for them). Without such claims,
 * the first sentence of the store's own description. Undefined when the
 * product has neither.
 */
export function pickBlurb(
  product: Pick<CatalogProduct, "manufacturerClaims" | "description">
): ShowcaseBlurb | undefined {
  const claims = (product.manufacturerClaims ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && line.length <= CLAIM_MAX_LENGTH && !LEGAL_CLAIM.test(line))
    .slice(0, BLURB_MAX_CLAIMS);
  if (claims.length > 0) return { lines: claims, fromMaker: true };

  // The first sentence ends at a full stop, "!" or "؟" followed by a space
  // or line break (so "۲.۵ گرم" isn't cut in the middle of the number).
  const firstSentence = (product.description ?? "").trim().split(/[.!؟?](?:\s|$)/)[0].trim();
  if (firstSentence) {
    return { lines: [truncate(firstSentence, BLURB_MAX_LENGTH)], fromMaker: false };
  }
  return undefined;
}

/**
 * Returns a shuffled copy (Fisher–Yates: every order is equally likely).
 * `random` is injectable so tests can make the order predictable.
 */
export function shuffle<T>(items: T[], random: () => number = Math.random): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Picks the product photos shown on a home-page category tile, from the
 * products that `matches` accepts and that have a real photo, in a random
 * order, so every visit shows a different mix. Brands go first (one product
 * each, so the tile mixes brands); any slots left are filled with other
 * products. Flavors and sizes of one product (same groupSlug) never appear
 * twice.
 *
 * As real photos are added, more products qualify and the tiles fill up
 * on their own.
 */
export function pickShowcaseProducts(
  products: CatalogProduct[],
  matches: (product: CatalogProduct) => boolean,
  limit: number,
  random: () => number = Math.random
): ShowcaseProduct[] {
  const candidates = shuffle(
    products.filter(
      (product) => matches(product) && product.imageUrl && product.imageUrl !== PLACEHOLDER_IMAGE
    ),
    random
  );

  const picked: CatalogProduct[] = [];
  const seenBrands = new Set<string>();
  const seenGroups = new Set<string>();

  function take(product: CatalogProduct) {
    picked.push(product);
    // A brandless product counts as its own brand, so it never blocks others.
    seenBrands.add(product.brand ?? `id:${product.id}`);
    seenGroups.add(product.groupSlug ?? `id:${product.id}`);
  }

  // First pass: one product per brand.
  for (const product of candidates) {
    if (picked.length === limit) break;
    if (seenBrands.has(product.brand ?? `id:${product.id}`)) continue;
    if (seenGroups.has(product.groupSlug ?? `id:${product.id}`)) continue;
    take(product);
  }

  // Second pass: fill what's left with other products of any brand.
  for (const product of candidates) {
    if (picked.length === limit) break;
    if (picked.includes(product)) continue;
    if (seenGroups.has(product.groupSlug ?? `id:${product.id}`)) continue;
    take(product);
  }

  return picked.map((product) => ({
    id: product.id,
    name: product.name,
    imageUrl: product.imageUrl,
    blurb: pickBlurb(product),
  }));
}
