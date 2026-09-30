import { connectToDatabase } from "@/lib/db";
import { ReviewModel } from "@/models/Review";

export interface PublicReview {
  name: string;
  rating: number;
  comment: string;
}

export async function getApprovedReviews(): Promise<PublicReview[]> {
  await connectToDatabase();
  const reviews = await ReviewModel.find({ approved: true })
    .sort({ createdAt: -1 })
    .limit(9)
    .lean();

  return reviews.map((review) => ({
    name: review.name,
    rating: review.rating,
    comment: review.comment,
  }));
}
