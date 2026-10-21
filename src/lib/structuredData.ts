// JSON-LD (https://schema.org) describing pages to search engines, so
// Google can show a product's price, stock and rating right in the results.
// Test the output with https://search.google.com/test/rich-results.

interface ProductForJsonLd {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  inStock: boolean;
  rating: number;
  reviewCount: number;
}

export interface BreadcrumbItem {
  name: string;
  /** Site-relative path, e.g. "/collections/protein". */
  path: string;
}

// Prices are stored in Toman, which has no ISO 4217 currency code; schema.org
// needs one, so they're given in Rial (IRR). 1 Toman = 10 Rial — the same
// conversion src/lib/zarinpal.ts makes for the gateway.
const RIAL_PER_TOMAN = 10;

// The shipping rules from /pages/shipping-policy; keep the two in sync.
// Free nationwide, handed to the courier the same day, delivered within
// 2–7 business days (Saturday to Thursday; Friday is the weekend).
const SHIPPING_DETAILS = {
  "@type": "OfferShippingDetails",
  shippingRate: { "@type": "MonetaryAmount", value: 0, currency: "IRR" },
  shippingDestination: { "@type": "DefinedRegion", addressCountry: "IR" },
  deliveryTime: {
    "@type": "ShippingDeliveryTime",
    handlingTime: { "@type": "QuantitativeValue", minValue: 0, maxValue: 0, unitCode: "DAY" },
    transitTime: { "@type": "QuantitativeValue", minValue: 2, maxValue: 7, unitCode: "DAY" },
    businessDays: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"].map(
        (day) => `https://schema.org/${day}`
      ),
    },
  },
};

function absoluteUrl(siteUrl: string, path: string): string {
  return new URL(path, siteUrl).toString();
}

interface ProductJsonLdOptions {
  /** Whether to include the price and stock offer; false while sales are closed. */
  includeOffer?: boolean;
}

export function buildProductJsonLd(
  product: ProductForJsonLd,
  siteUrl: string,
  { includeOffer = true }: ProductJsonLdOptions = {}
) {
  const url = absoluteUrl(siteUrl, `/products/${product.id}`);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: absoluteUrl(siteUrl, product.imageUrl),
    // Left out when empty: an invented description could mislead Google.
    ...(product.description ? { description: product.description } : {}),
    sku: product.id,
    url,
    ...(includeOffer
      ? {
          offers: {
            "@type": "Offer",
            url,
            price: product.price * RIAL_PER_TOMAN,
            priceCurrency: "IRR",
            availability: product.inStock
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
            itemCondition: "https://schema.org/NewCondition",
            shippingDetails: SHIPPING_DETAILS,
          },
        }
      : {}),
    // Google rejects a rating with no reviews behind it.
    ...(product.reviewCount > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: product.rating,
            reviewCount: product.reviewCount,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
  };
}

export function buildBreadcrumbJsonLd(items: BreadcrumbItem[], siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(siteUrl, item.path),
    })),
  };
}

/**
 * JSON.stringify for a <script> tag. A product name or description
 * containing "</script>" would otherwise end the tag early and let the rest
 * run as HTML; "<" is written as its JSON escape < instead, which reads
 * back as the same character (as the Next.js JSON-LD guide recommends).
 */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
