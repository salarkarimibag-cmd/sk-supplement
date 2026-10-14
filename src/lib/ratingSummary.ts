export interface RatingSummary {
  rating: number;
  reviewCount: number;
}

/**
 * Turns the `$avg` / `$sum` of a product's approved reviews into the values
 * stored on the product. No group (no approved reviews) means no rating,
 * and the average is kept to one decimal (4.33… → 4.3) for display.
 */
export function toRatingSummary(group: { average: number; count: number } | undefined): RatingSummary {
  if (!group || group.count === 0) return { rating: 0, reviewCount: 0 };
  return { rating: Math.round(group.average * 10) / 10, reviewCount: group.count };
}
