"use client";

import Link from "next/link";
import { useSessionUser } from "@/hooks/useSessionUser";

// Client-side because the product page is prerendered for everyone, so the
// server can't tell whether this visitor is logged in.
export default function ReviewLoginHint({ productId }: { productId: string }) {
  const user = useSessionUser();
  if (user) return null;

  return (
    <p className="mx-auto mt-10 max-w-xl text-center text-sm text-zinc-500 dark:text-zinc-400">
      این محصول را خریده‌اید؟{" "}
      <Link
        href={`/account/login?next=${encodeURIComponent(`/products/${productId}`)}`}
        className="font-semibold text-sky-600 hover:underline"
      >
        وارد حسابتان شوید
      </Link>{" "}
      تا نظرتان با برچسب «خریدار این محصول» نمایش داده شود.
    </p>
  );
}
