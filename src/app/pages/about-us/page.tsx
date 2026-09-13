import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "درباره ما",
  description: "معرفی SK Supplement، فروشگاه آنلاین مکمل‌های ورزشی.",
};

export default function AboutUsPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-12">
      <h1 className="text-2xl font-bold">درباره ما</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">معرفی SK Supplement به‌زودی اضافه می‌شود.</p>
    </div>
  );
}
