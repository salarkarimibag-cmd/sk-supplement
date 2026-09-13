import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "پروفایل کاربری",
  robots: { index: false, follow: false },
};

export default function ProfilePage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12">
      <h1 className="text-2xl font-bold">پروفایل کاربری</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        اطلاعات حساب کاربری به‌زودی نمایش داده می‌شود.
      </p>
    </div>
  );
}
