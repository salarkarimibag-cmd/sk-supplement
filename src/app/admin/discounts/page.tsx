import type { Metadata } from "next";
import { connectToDatabase } from "@/lib/db";
import { DiscountCodeModel } from "@/models/DiscountCode";
import DiscountManager from "@/components/admin/DiscountManager";
import Pagination from "@/components/ui/Pagination";

export const metadata: Metadata = {
  title: "مدیریت کدهای تخفیف",
  robots: { index: false, follow: false },
};

const PAGE_SIZE = 10;

export default async function AdminDiscountsPage(props: PageProps<"/admin/discounts">) {
  const { page: pageParam } = await props.searchParams;
  const requestedPage = Number(Array.isArray(pageParam) ? pageParam[0] : pageParam) || 1;

  await connectToDatabase();

  const totalCount = await DiscountCodeModel.countDocuments();
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const currentPage = Math.min(Math.max(requestedPage, 1), totalPages);

  const codes = await DiscountCodeModel.find()
    .sort({ createdAt: -1 })
    .skip((currentPage - 1) * PAGE_SIZE)
    .limit(PAGE_SIZE)
    .lean();

  const initialCodes = codes.map((code) => ({
    id: String(code._id),
    code: code.code,
    type: code.type,
    value: code.value,
    active: code.active,
    expiresAt: code.expiresAt ? code.expiresAt.toISOString() : null,
  }));

  function hrefForPage(page: number) {
    return page === 1 ? "/admin/discounts" : `/admin/discounts?page=${page}`;
  }

  return (
    <div>
      <h2 className="text-lg font-bold">مدیریت کدهای تخفیف</h2>
      <DiscountManager initialCodes={initialCodes} />
      <Pagination currentPage={currentPage} totalPages={totalPages} hrefForPage={hrefForPage} />
    </div>
  );
}
