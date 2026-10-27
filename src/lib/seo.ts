import type { Metadata } from "next";

export const SITE_NAME = "SK Supplement";

/** The link-preview image for pages that don't have one of their own. */
export const DEFAULT_SHARE_IMAGE = "/images/promo-banner.webp";

// Next.js merges metadata shallowly: a page that sets `openGraph` replaces
// the layout's whole `openGraph` object, so the fields every page shares are
// kept here and spread into each one.
export const SHARED_OPEN_GRAPH = {
  siteName: SITE_NAME,
  locale: "fa_IR",
  type: "website",
} as const;

// About what Google shows under a result before cutting it off.
const DESCRIPTION_MAX_LENGTH = 160;

/**
 * Turns a page's text into a meta description: whitespace collapsed to
 * single spaces, and if it's too long, cut at the last word that fits with
 * an ellipsis, rather than mid-word.
 */
export function toMetaDescription(text: string): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= DESCRIPTION_MAX_LENGTH) return clean;
  const cut = clean.slice(0, DESCRIPTION_MAX_LENGTH - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).replace(/[،,؛;:.\s]+$/, "")}…`;
}

interface PageMetadataInput {
  title: string;
  description: string;
  /** The page's own path, without query string (e.g. "/products/on1"). */
  path: string;
  /** Path or URL of the link-preview image; the site banner when omitted. */
  image?: string;
}

/**
 * The metadata a page needs to be shared and indexed on its own: its title
 * and description in search results and link previews (Telegram, WhatsApp,
 * …), its own image, and a canonical URL so query-string variants of the
 * page (?reviews=2, ?brand=…) count as the same page. Relative paths are
 * made absolute by the layout's metadataBase.
 */
export function pageMetadata({
  title,
  description,
  path,
  image = DEFAULT_SHARE_IMAGE,
}: PageMetadataInput): Metadata {
  const metaDescription = toMetaDescription(description);
  return {
    title,
    description: metaDescription,
    alternates: { canonical: path },
    openGraph: {
      ...SHARED_OPEN_GRAPH,
      title,
      description: metaDescription,
      url: path,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: metaDescription,
      images: [image],
    },
  };
}
