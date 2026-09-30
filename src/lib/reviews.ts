import { connectToDatabase } from "@/lib/db";
import { ReviewModel } from "@/models/Review";

export interface PublicReview {
  name: string;
  rating: number;
  comment: string;
}

const HOMEPAGE_REVIEW_COUNT = 6;

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
    { $match: { approved: true } },
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

  const totalCount = await ReviewModel.countDocuments({ approved: true });
  const totalPages = Math.max(1, Math.ceil(totalCount / REVIEWS_PAGE_SIZE));
  const currentPage = Math.min(Math.max(page, 1), totalPages);

  const reviews = await ReviewModel.find({ approved: true })
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
