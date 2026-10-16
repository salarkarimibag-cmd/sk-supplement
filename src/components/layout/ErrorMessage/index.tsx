"use client";

import { useEffect } from "react";

type ErrorMessageProps = {
  error: Error & { digest?: string };
  retry: () => void;
};

// Shared fallback UI for app/error.tsx and app/global-error.tsx.
// It uses a plain <a> for the home link instead of next/link: when the error
// came from the root layout, a full page load is the most reliable way out.
export default function ErrorMessage({ error, retry }: ErrorMessageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto w-full max-w-md px-6 py-20 text-center">
      <h1 className="text-2xl font-bold text-red-600 dark:text-red-500">مشکلی پیش آمد</h1>
      <p className="mt-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        در نمایش این صفحه خطایی رخ داد. لطفاً دوباره تلاش کنید. اگر مشکل ادامه داشت، چند دقیقه
        بعد سر بزنید.
      </p>
      {error.digest && (
        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-500">
          کد پیگیری: <span dir="ltr" className="font-mono">{error.digest}</span>
        </p>
      )}

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={() => retry()}
          className="cursor-pointer rounded bg-sky-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-sky-500"
        >
          تلاش دوباره
        </button>
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- see the comment above */}
        <a
          href="/"
          className="rounded border border-sky-600 px-6 py-3 text-sm font-bold text-sky-600 transition hover:bg-sky-50 dark:hover:bg-sky-950"
        >
          بازگشت به صفحه اصلی
        </a>
      </div>
    </div>
  );
}
