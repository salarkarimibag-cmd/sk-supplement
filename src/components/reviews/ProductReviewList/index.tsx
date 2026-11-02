"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Testimonials from "@/components/home/Testimonials";
import Pagination from "@/components/ui/Pagination";
import type { ProductReviewsPage } from "@/lib/reviews";

interface ProductReviewListProps {
  productId: string;
  /** The first page, part of the prerendered HTML so search engines see it. */
  firstPage: ProductReviewsPage;
}

function ReviewsPageView({ productId, page }: { productId: string; page: ProductReviewsPage }) {
  // The #reviews anchor brings the shopper back to the reviews after the page loads.
  const productPath = `/products/${productId}`;
  function reviewsHref(pageNumber: number) {
    return pageNumber === 1
      ? `${productPath}#reviews`
      : `${productPath}?reviews=${pageNumber}#reviews`;
  }

  return (
    <>
      <div className="mt-10">
        <Testimonials reviews={page.reviews} />
      </div>
      <Pagination
        currentPage={page.currentPage}
        totalPages={page.totalPages}
        hrefForPage={reviewsHref}
      />
    </>
  );
}

// The product page is prerendered, so it can't read ?reviews=N on the server:
// later pages are asked for here, after the page loads.
function ReviewsForCurrentUrl({ productId, firstPage }: ProductReviewListProps) {
  const requestedPage = Number(useSearchParams().get("reviews")) || 1;
  const [loadedPage, setLoadedPage] = useState<ProductReviewsPage | null>(null);

  useEffect(() => {
    if (requestedPage === 1) return;

    // A newer page's request replaces this one.
    const controller = new AbortController();
    fetch(`/api/reviews?productId=${encodeURIComponent(productId)}&page=${requestedPage}`, {
      signal: controller.signal,
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((page: ProductReviewsPage | null) => setLoadedPage(page))
      .catch(() => {
        // Aborted, or offline: keep showing what we had.
      });
    return () => controller.abort();
  }, [productId, requestedPage]);

  const page = requestedPage === 1 ? firstPage : (loadedPage ?? firstPage);
  return <ReviewsPageView productId={productId} page={page} />;
}

export default function ProductReviewList({ productId, firstPage }: ProductReviewListProps) {
  // useSearchParams has no value while prerendering, so without this boundary
  // the first page would be missing from the HTML.
  return (
    <Suspense fallback={<ReviewsPageView productId={productId} page={firstPage} />}>
      <ReviewsForCurrentUrl productId={productId} firstPage={firstPage} />
    </Suspense>
  );
}
