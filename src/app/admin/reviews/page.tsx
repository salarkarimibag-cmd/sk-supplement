import type { Metadata } from "next";
import { connectToDatabase } from "@/lib/db";
import { ReviewModel } from "@/models/Review";
import ReviewManager from "@/components/admin/ReviewManager";

export const metadata: Metadata = {
  title: "مدیریت نظرات مشتریان",
  robots: { index: false, follow: false },
};

export default async function AdminReviewsPage() {
  await connectToDatabase();
  const reviews = await ReviewModel.find().sort({ createdAt: -1 }).lean();

  const initialReviews = reviews.map((review) => ({
    id: String(review._id),
    name: review.name,
    rating: review.rating,
    comment: review.comment,
    approved: review.approved,
    ip: review.ip ?? "—",
    createdAt: review.createdAt ? new Date(review.createdAt).toISOString() : null,
  }));

  return (
    <div>
      <h2 className="text-lg font-bold">مدیریت نظرات مشتریان</h2>
      <ReviewManager initialReviews={initialReviews} />
    </div>
  );
}
