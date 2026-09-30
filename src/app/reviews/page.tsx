import type { Metadata } from "next";
import Testimonials from "@/components/home/Testimonials";
import ReviewForm from "@/components/reviews/ReviewForm";
import Pagination from "@/components/ui/Pagination";
import { getApprovedReviewsPage } from "@/lib/reviews";

export const metadata: Metadata = {
  title: "نظرات مشتریان",
  description: "نظرات مشتریان SK Supplement درباره‌ی محصولات و خدمات فروشگاه.",
};

export default async function ReviewsPage(props: PageProps<"/reviews">) {
  const { page: pageParam } = await props.searchParams;
  const requestedPage = Number(Array.isArray(pageParam) ? pageParam[0] : pageParam) || 1;

  const { reviews, currentPage, totalPages } = await getApprovedReviewsPage(requestedPage);

  function hrefForPage(page: number) {
    return page === 1 ? "/reviews" : `/reviews?page=${page}`;
  }

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
          <Pagination currentPage={currentPage} totalPages={totalPages} hrefForPage={hrefForPage} />
        </div>
      )}

      <ReviewForm />
    </div>
  );
}
