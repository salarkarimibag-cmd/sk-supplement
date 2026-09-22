import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { DiscountCodeModel } from "@/models/DiscountCode";
import DiscountManager from "@/components/admin/DiscountManager";

export const metadata: Metadata = {
  title: "مدیریت کدهای تخفیف",
  robots: { index: false, follow: false },
};

export default async function AdminDiscountsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/account/login");

  if (!user.isAdmin) {
    return (
      <div className="mx-auto w-full max-w-3xl px-6 py-16 text-center">
        <h1 className="text-2xl font-bold">دسترسی غیرمجاز</h1>
        <p className="mt-3 text-zinc-600 dark:text-zinc-400">
          این صفحه فقط برای مدیران سایت در دسترس است.
        </p>
      </div>
    );
  }

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
    <div className="mx-auto w-full max-w-4xl px-6 py-12">
      <h1 className="text-2xl font-bold">مدیریت کدهای تخفیف</h1>
      <DiscountManager initialCodes={initialCodes} />
    </div>
  );
}
