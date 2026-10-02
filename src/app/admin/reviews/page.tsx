import type { Metadata } from "next";
import { connectToDatabase } from "@/lib/db";
import { ReviewModel } from "@/models/Review";
import ReviewManager from "@/components/admin/ReviewManager";
import Pagination from "@/components/ui/Pagination";

export const metadata: Metadata = {
  title: "مدیریت نظرات مشتریان",
  robots: { index: false, follow: false },
};

const PAGE_SIZE = 10;

export default async function AdminReviewsPage(props: PageProps<"/admin/reviews">) {
  const { page: pageParam } = await props.searchParams;
  const requestedPage = Number(Array.isArray(pageParam) ? pageParam[0] : pageParam) || 1;

  await connectToDatabase();

  const totalCount = await ReviewModel.countDocuments();
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const currentPage = Math.min(Math.max(requestedPage, 1), totalPages);

  const reviews = await ReviewModel.find()
    .sort({ createdAt: -1 })
    .skip((currentPage - 1) * PAGE_SIZE)
    .limit(PAGE_SIZE)
    .lean();

  const initialReviews = reviews.map((review) => ({
    id: String(review._id),
    name: review.name,
    rating: review.rating,
    comment: review.comment,
    approved: review.approved,
    ip: review.ip ?? "—",
    createdAt: review.createdAt ? new Date(review.createdAt).toISOString() : null,
  }));

  function hrefForPage(page: number) {
    return page === 1 ? "/admin/reviews" : `/admin/reviews?page=${page}`;
  }

  return (
    <div>
      <h2 className="text-lg font-bold">مدیریت نظرات مشتریان</h2>
      <ReviewManager initialReviews={initialReviews} />
      <Pagination currentPage={currentPage} totalPages={totalPages} hrefForPage={hrefForPage} />
    </div>
  );
}
