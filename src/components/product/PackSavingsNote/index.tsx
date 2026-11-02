import type { PackSavings } from "@/lib/packs";
import { SALES_OPEN } from "@/lib/sales";

/**
 * The separate-purchase price, crossed out, and the percent saved. Hidden
 * while sales are closed, when no prices are shown (see src/lib/sales.ts).
 */
export default function PackSavingsNote({
  savings,
  className = "",
}: {
  savings: PackSavings | null;
  className?: string;
}) {
  if (!savings || !SALES_OPEN) return null;

  return (
    <p className={`flex flex-wrap items-center gap-2 text-sm ${className}`}>
      <del className="text-zinc-500 dark:text-zinc-400">
        <span className="sr-only">قیمت خرید جداگانه: </span>
        {savings.fullPrice.toLocaleString("fa-IR")} تومان
      </del>
      <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-xs font-bold text-sky-700 dark:bg-sky-950 dark:text-sky-300">
        {savings.percent.toLocaleString("fa-IR")}٪ صرفه‌جویی
      </span>
    </p>
  );
}
