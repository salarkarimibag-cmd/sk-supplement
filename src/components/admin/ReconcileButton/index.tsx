"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ReconcileResult } from "@/lib/zarinpalOrders";

function summarize({ paid, failed, unknown }: ReconcileResult): string {
  const parts = [
    paid ? `${paid.toLocaleString("fa-IR")} پرداخت تأیید شد` : "",
    failed ? `${failed.toLocaleString("fa-IR")} سفارش ناموفق شد` : "",
    unknown ? `${unknown.toLocaleString("fa-IR")} سفارش هنوز نامشخص است` : "",
  ].filter(Boolean);
  return parts.length > 0 ? `${parts.join(" · ")}.` : "سفارش معلقی برای بررسی نبود.";
}

/**
 * Asks ZarinPal about the orders left pending (a buyer who paid but closed
 * the tab before the callback, or one who never paid) and settles them.
 */
export default function ReconcileButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function handleClick() {
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/orders/reconcile", { method: "POST" });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data.message ?? "بررسی پرداخت‌ها ناموفق بود.");
        return;
      }
      setMessage(summarize(data));
      // Reloads the list from the server, without the orders just settled.
      router.refresh();
    } catch {
      setMessage("ارتباط با سرور برقرار نشد.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
      <button
        type="button"
        onClick={handleClick}
        disabled={busy}
        className="cursor-pointer rounded bg-sky-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy ? "در حال بررسی…" : "بررسی وضعیت در زرین‌پال"}
      </button>
      <p role="status" className="text-zinc-600 dark:text-zinc-400">
        {message || "سفارش‌های بیش از ۳۰ دقیقه معلق را از زرین‌پال استعلام می‌کند."}
      </p>
    </div>
  );
}
