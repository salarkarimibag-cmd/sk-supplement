"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

interface PaymentResultProps {
  success: boolean;
  message?: string;
  refId?: number;
}

export default function PaymentResult({ success, message, refId }: PaymentResultProps) {
  const { clearCart } = useCart();

  useEffect(() => {
    if (success) clearCart();
    // Only run once, right after the payment result is known.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [success]);

  return (
    <div className="mx-auto w-full max-w-md px-6 py-20 text-center">
      {success ? (
        <>
          <h1 className="text-2xl font-bold text-emerald-600">پرداخت با موفقیت انجام شد</h1>
          {refId && (
            <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">کد پیگیری: {refId}</p>
          )}
        </>
      ) : (
        <>
          <h1 className="text-2xl font-bold text-red-600">پرداخت ناموفق بود</h1>
          {message && <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">{message}</p>}
        </>
      )}

      <Link
        href="/"
        className="mt-8 inline-block rounded bg-sky-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-sky-500"
      >
        بازگشت به فروشگاه
      </Link>
    </div>
  );
}
