import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "قوانین بازگشت وجه",
  description: "قوانین و شرایط بازگشت وجه در فروشگاه SK Supplement.",
};

export default function RefundPolicyPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-12">
      <h1 className="text-2xl font-bold">قوانین بازگشت وجه</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        قوانین بازگشت وجه به‌زودی اضافه می‌شوند.
      </p>
    </div>
  );
}
