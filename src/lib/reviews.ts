import { connectToDatabase } from "@/lib/db";
import { SOLD_ORDER_STATUSES } from "@/lib/orderStatus";
import { toRatingSummary } from "@/lib/ratingSummary";
import { OrderModel } from "@/models/Order";
import { ProductModel } from "@/models/Product";
import { ReviewModel } from "@/models/Review";

export interface PublicReview {
  name: string;
  rating: number;
  comment: string;
  /** Only product reviews can carry it; store reviews leave it out. */
  verifiedPurchase?: boolean;
}

/**
 * Whether the user has a paid (or shipped) order containing the product.
 * Matches on the order's userId only: emails aren't verified, so matching
 * a guest order by email would let anyone claim someone else's purchase.
 */
export async function hasPurchased(userId: string, productId: string): Promise<boolean> {
  await connectToDatabase();
  const order = await OrderModel.exists({
    userId,
    status: { $in: SOLD_ORDER_STATUSES },
    "items.productId": productId,
  });
  return order !== null;
}

// Reviews of the store itself; product reviews are shown on their product's page.
const approvedStoreReviews = { approved: true, productId: { $exists: false } };

const HOMEPAGE_REVIEW_COUNT = 3;

interface HomepageReviewsFacetResult {
  reviews: PublicReview[];
  stats: [{ average: number; count: number }] | [];
}

// Fetches the homepage's review slice, the total approved count and the
// average rating in a single round trip (via $facet) instead of separate
// queries.
export async function getHomepageReviews(): Promise<{
  reviews: PublicReview[];
  totalCount: number;
  /** Average of all approved store reviews, to one decimal; 0 if none. */
  averageRating: number;
}> {
  await connectToDatabase();

  const [result] = await ReviewModel.aggregate<HomepageReviewsFacetResult>([
    { $match: approvedStoreReviews },
    { $sort: { createdAt: -1 } },
    {
      $facet: {
        reviews: [
          { $limit: HOMEPAGE_REVIEW_COUNT },
          { $project: { _id: 0, name: 1, rating: 1, comment: 1 } },
        ],
        stats: [{ $group: { _id: null, average: { $avg: "$rating" }, count: { $sum: 1 } } }],
      },
    },
  ]);

  const { rating, reviewCount } = toRatingSummary(result?.stats[0]);
  return {
    reviews: result?.reviews ?? [],
    totalCount: reviewCount,
    averageRating: rating,
  };
}

const REVIEWS_PAGE_SIZE = 12;

export async function getApprovedReviewsPage(
  page: number
): Promise<{ reviews: PublicReview[]; currentPage: number; totalPages: number }> {
  await connectToDatabase();

  const totalCount = await ReviewModel.countDocuments(approvedStoreReviews);
  const totalPages = Math.max(1, Math.ceil(totalCount / REVIEWS_PAGE_SIZE));
  const currentPage = Math.min(Math.max(page, 1), totalPages);

  const reviews = await ReviewModel.find(approvedStoreReviews)
    .sort({ createdAt: -1 })
    .skip((currentPage - 1) * REVIEWS_PAGE_SIZE)
    .limit(REVIEWS_PAGE_SIZE)
    .lean();

  return {
    reviews: reviews.map((review) => ({
      name: review.name,
      rating: review.rating,
      comment: review.comment,
    })),
    currentPage,
    totalPages,
  };
}

/** One page of a product's approved reviews, newest first. */
export async function getProductReviewsPage(
  productId: string,
  page: number,
  pageSize: number
): Promise<{ reviews: PublicReview[]; currentPage: number; totalPages: number }> {
  await connectToDatabase();

  const filter = { productId, approved: true };
  const totalCount = await ReviewModel.countDocuments(filter);
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const currentPage = Math.min(Math.max(page, 1), totalPages);

  const reviews = await ReviewModel.find(filter, {
    _id: 0,
    name: 1,
    rating: 1,
    comment: 1,
    verifiedPurchase: 1,
  })
    .sort({ createdAt: -1 })
    .skip((currentPage - 1) * pageSize)
    .limit(pageSize)
    .lean<PublicReview[]>();

  return { reviews, currentPage, totalPages };
}

/**
 * Recomputes a product's rating and reviewCount from its approved reviews.
 *
 * Called after an admin approves, unapproves or deletes one of its reviews.
 * It recounts from scratch instead of using $inc, so running it twice, or
 * after an approve/unapprove pair, still leaves the right numbers.
 */
export async function refreshProductRating(productId: string): Promise<void> {
  await connectToDatabase();
  const [group] = await ReviewModel.aggregate<{ average: number; count: number }>([
    { $match: { productId, approved: true } },
    { $group: { _id: null, average: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);
  await ProductModel.updateOne({ id: productId }, { $set: toRatingSummary(group) });
}
