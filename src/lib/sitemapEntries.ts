import type { MetadataRoute } from "next";

// Pages with no date of their own (policies, about, contact). They get no
// lastModified: Google says to leave it out rather than guess, and it stops
// trusting the field from sites whose dates are always "now".
const STATIC_PATHS = [
  "/pages/about-us",
  "/pages/contact-us",
  "/pages/faq",
  "/pages/accessibility",
  "/pages/privacy-policy",
  "/pages/refund-policy",
  "/pages/authenticity-guarantee",
  "/pages/shipping-policy",
  "/pages/terms-of-service",
];

interface Dated {
  /** A MongoDB ObjectId; the first 4 bytes of one are its creation time. */
  _id?: { getTimestamp(): Date };
  updatedAt?: Date | string;
}

/**
 * When a document last changed: its updatedAt, or — for products saved
 * before updatedAt existed — when it was created, read from its _id.
 * Undefined if neither is available.
 */
export function lastModifiedOf(doc: Dated): Date | undefined {
  if (doc.updatedAt) return new Date(doc.updatedAt);
  return doc._id?.getTimestamp();
}

/** The most recent of some dates, ignoring missing ones. */
export function latestDate(dates: (Date | undefined)[]): Date | undefined {
  const times = dates.filter((date): date is Date => date !== undefined).map((date) => date.getTime());
  return times.length > 0 ? new Date(Math.max(...times)) : undefined;
}

interface SitemapInput {
  siteUrl: string;
  products: (Dated & { id: string; categorySlug: string })[];
  categories: { slug: string }[];
  posts: { slug: string; publishedAt: Date | string }[];
}

export function buildSitemapEntries({
  siteUrl,
  products,
  categories,
  posts,
}: SitemapInput): MetadataRoute.Sitemap {
  const productDates = products.map((product) => ({
    product,
    date: lastModifiedOf(product),
  }));
  const postDates = posts.map((post) => new Date(post.publishedAt));

  const newestPost = latestDate(postDates);
  // The home page lists the latest products and articles.
  const home = latestDate([...productDates.map(({ date }) => date), newestPost]);

  return [
    { url: siteUrl, lastModified: home },
    { url: `${siteUrl}/blogs`, lastModified: newestPost },
    ...STATIC_PATHS.map((path) => ({ url: `${siteUrl}${path}` })),
    ...categories.map((category) => ({
      url: `${siteUrl}/collections/${category.slug}`,
      // A category page is a list of its products.
      lastModified: latestDate(
        productDates.filter(({ product }) => product.categorySlug === category.slug).map(({ date }) => date)
      ),
    })),
    ...posts.map((post, index) => ({
      url: `${siteUrl}/blogs/${post.slug}`,
      lastModified: postDates[index],
    })),
    ...productDates.map(({ product, date }) => ({
      url: `${siteUrl}/products/${product.id}`,
      lastModified: date,
    })),
  ];
}
