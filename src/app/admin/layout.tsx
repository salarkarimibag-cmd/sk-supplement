import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: ReactNode }) {
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

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-12">
      <h1 className="text-2xl font-bold">پنل مدیریت</h1>

      <nav className="mt-6 flex gap-4 border-b border-zinc-200 dark:border-zinc-800">
        <Link
          href="/admin/products"
          className="border-b-2 border-transparent px-1 pb-3 text-sm font-semibold text-zinc-600 hover:border-sky-600 hover:text-sky-600 dark:text-zinc-400"
        >
          محصولات
        </Link>
        <Link
          href="/admin/discounts"
          className="border-b-2 border-transparent px-1 pb-3 text-sm font-semibold text-zinc-600 hover:border-sky-600 hover:text-sky-600 dark:text-zinc-400"
        >
          کدهای تخفیف
        </Link>
        <Link
          href="/admin/reviews"
          className="border-b-2 border-transparent px-1 pb-3 text-sm font-semibold text-zinc-600 hover:border-sky-600 hover:text-sky-600 dark:text-zinc-400"
        >
          نظرات
        </Link>
        <Link
          href="/admin/messages"
          className="border-b-2 border-transparent px-1 pb-3 text-sm font-semibold text-zinc-600 hover:border-sky-600 hover:text-sky-600 dark:text-zinc-400"
        >
          پیام‌های تماس
        </Link>
        <Link
          href="/admin/subscribers"
          className="border-b-2 border-transparent px-1 pb-3 text-sm font-semibold text-zinc-600 hover:border-sky-600 hover:text-sky-600 dark:text-zinc-400"
        >
          مشترکین خبرنامه
        </Link>
      </nav>

      <div className="mt-8">{children}</div>
    </div>
  );
}
