import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "سوالات متداول",
  description: "پاسخ سوالات متداول درباره‌ی خرید، ارسال و محصولات SK Supplement.",
};

export default function FaqPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-12">
      <h1 className="text-2xl font-bold">سوالات متداول</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">سوالات متداول به‌زودی اضافه می‌شوند.</p>
    </div>
  );
}
