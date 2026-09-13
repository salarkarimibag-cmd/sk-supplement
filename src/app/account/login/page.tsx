import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ورود",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <div className="mx-auto w-full max-w-md px-6 py-12">
      <h1 className="text-2xl font-bold">ورود</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">فرم ورود به‌زودی اضافه می‌شود.</p>
    </div>
  );
}
