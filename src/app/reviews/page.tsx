import type { Metadata } from "next";
import Testimonials from "@/components/home/Testimonials";
import ReviewForm from "@/components/reviews/ReviewForm";
import { getAllApprovedReviews } from "@/lib/reviews";

export const metadata: Metadata = {
  title: "نظرات مشتریان",
  description: "نظرات مشتریان SK Supplement درباره‌ی محصولات و خدمات فروشگاه.",
};

export default async function ReviewsPage() {
  const reviews = await getAllApprovedReviews();

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12">
      <h1 className="text-center text-2xl font-bold">نظرات مشتریان</h1>

      {reviews.length === 0 ? (
        <p className="mt-4 text-center text-zinc-600 dark:text-zinc-400">
          هنوز نظری ثبت نشده است.
        </p>
      ) : (
        <div className="mt-10">
          <Testimonials reviews={reviews} />
        </div>
      )}

      <ReviewForm />
    </div>
  );
}
