import { BadgeInfo } from "lucide-react";

/**
 * What the maker claims on the pack, set apart in its own box so shoppers
 * can tell it from the store's own description. `claims` is one claim per
 * line; renders nothing when there are none.
 */
export default function ManufacturerClaims({ claims }: { claims?: string }) {
  const lines = (claims ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length === 0) return null;

  return (
    <aside
      aria-labelledby="manufacturer-claims-heading"
      className="border-s-4 border-sky-600 bg-sky-50 p-4 dark:bg-sky-950/40"
    >
      <h2
        id="manufacturer-claims-heading"
        className="flex items-center gap-2 text-sm font-bold text-sky-800 dark:text-sky-300"
      >
        <BadgeInfo aria-hidden="true" className="h-4 w-4 shrink-0" />
        ادعاهای سازنده (چاپ‌شده روی بسته)
      </h2>
      <ul className="mt-3 list-disc space-y-1 ps-5 text-sm font-semibold text-zinc-800 dark:text-zinc-200">
        {lines.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-zinc-600 dark:text-zinc-400">
        این ادعاها از سوی سازنده بیان شده و توسط فروشگاه ارزیابی یا تضمین نمی‌شود.
      </p>
    </aside>
  );
}
