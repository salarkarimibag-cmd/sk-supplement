import { connectToDatabase } from "@/lib/db";
import { ReviewModel } from "@/models/Review";

export interface PublicReview {
  name: string;
  rating: number;
  comment: string;
}

const HOMEPAGE_REVIEW_COUNT = 6;

export async function getApprovedReviews(): Promise<PublicReview[]> {
  await connectToDatabase();
  const reviews = await ReviewModel.find({ approved: true })
    .sort({ createdAt: -1 })
    .limit(HOMEPAGE_REVIEW_COUNT)
    .lean();

  return reviews.map((review) => ({
    name: review.name,
    rating: review.rating,
    comment: review.comment,
  }));
}

export async function getApprovedReviewsCount(): Promise<number> {
  await connectToDatabase();
  return ReviewModel.countDocuments({ approved: true });
}

export async function getAllApprovedReviews(): Promise<PublicReview[]> {
  await connectToDatabase();
  const reviews = await ReviewModel.find({ approved: true }).sort({ createdAt: -1 }).lean();

  return reviews.map((review) => ({
    name: review.name,
    rating: review.rating,
    comment: review.comment,
  }));
}
