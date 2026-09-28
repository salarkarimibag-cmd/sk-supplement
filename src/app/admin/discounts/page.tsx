import type { Metadata } from "next";
import { connectToDatabase } from "@/lib/db";
import { DiscountCodeModel } from "@/models/DiscountCode";
import DiscountManager from "@/components/admin/DiscountManager";

export const metadata: Metadata = {
  title: "مدیریت کدهای تخفیف",
  robots: { index: false, follow: false },
};

export default async function AdminDiscountsPage() {
  await connectToDatabase();
  const codes = await DiscountCodeModel.find().sort({ createdAt: -1 }).lean();

  const initialCodes = codes.map((code) => ({
    id: String(code._id),
    code: code.code,
    type: code.type,
    value: code.value,
    active: code.active,
    expiresAt: code.expiresAt ? code.expiresAt.toISOString() : null,
  }));

  return (
    <div>
      <h2 className="text-lg font-bold">مدیریت کدهای تخفیف</h2>
      <DiscountManager initialCodes={initialCodes} />
    </div>
  );
}
