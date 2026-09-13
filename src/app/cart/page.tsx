import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "سبد خرید",
  robots: { index: false, follow: false },
};

export default function CartPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12">
      <h1 className="text-2xl font-bold">سبد خرید</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">سبد خرید شما خالی است.</p>
    </div>
  );
}
