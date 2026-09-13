import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "حریم خصوصی",
  description: "سیاست حریم خصوصی و نحوه‌ی استفاده از اطلاعات کاربران در SK Supplement.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-12">
      <h1 className="text-2xl font-bold">حریم خصوصی</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        حریم خصوصی به‌زودی اضافه می‌شود.
      </p>
    </div>
  );
}
