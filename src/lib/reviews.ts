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
  totalCount: [{ count: number }] | [];
}

// Fetches the homepage's review slice and the total approved count in a
// single round trip (via $facet) instead of two separate queries.
export async function getHomepageReviews(): Promise<{
  reviews: PublicReview[];
  totalCount: number;
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
        totalCount: [{ $count: "count" }],
      },
    },
  ]);

  return {
    reviews: result?.reviews ?? [],
    totalCount: result?.totalCount[0]?.count ?? 0,
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

/** A product's newest approved reviews, for its page. */
export async function getProductReviews(productId: string, limit: number): Promise<PublicReview[]> {
  await connectToDatabase();
  return ReviewModel.find(
    { productId, approved: true },
    { _id: 0, name: 1, rating: 1, comment: 1, verifiedPurchase: 1 }
  )
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean<PublicReview[]>();
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
