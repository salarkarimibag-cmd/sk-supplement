import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import type { NutritionFact } from "@/lib/productDetails";

interface ProductInfoProps {
  servingSize?: string;
  nutritionFacts?: NutritionFact[];
  usage?: string;
  warnings?: string;
}

/**
 * One collapsible section. A native <details>/<summary> opens and closes
 * without JavaScript, is announced as expandable by screen readers, and its
 * content stays in the HTML for search engines even while closed.
 */
function Section({ title, defaultOpen, children }: { title: string; defaultOpen?: boolean; children: ReactNode }) {
  return (
    <details open={defaultOpen} className="group border-b border-zinc-200 dark:border-zinc-800">
      <summary className="flex cursor-pointer list-none items-center justify-between py-4 font-bold [&::-webkit-details-marker]:hidden">
        {title}
        <ChevronDown
          aria-hidden="true"
          className="h-5 w-5 shrink-0 text-zinc-500 transition-transform group-open:rotate-180"
        />
      </summary>
      <div className="pb-5 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{children}</div>
    </details>
  );
}

/** The product's label details; renders nothing until an admin fills any of them in. */
export default function ProductInfo({
  servingSize,
  nutritionFacts = [],
  usage,
  warnings,
}: ProductInfoProps) {
  const hasNutrition = nutritionFacts.length > 0;
  if (!hasNutrition && !usage && !warnings) return null;

  return (
    <section aria-label="مشخصات محصول" className="border-t border-zinc-200 dark:border-zinc-800">
      {hasNutrition && (
        <Section title="ارزش غذایی" defaultOpen>
          <table className="w-full text-start">
            {servingSize && (
              <caption className="pb-3 text-start text-zinc-500">هر وعده: {servingSize}</caption>
            )}
            <thead className="sr-only">
              <tr>
                <th scope="col">ماده</th>
                <th scope="col">مقدار</th>
              </tr>
            </thead>
            <tbody>
              {nutritionFacts.map((fact) => (
                <tr
                  key={fact.label}
                  className="border-t border-zinc-100 first:border-t-0 dark:border-zinc-800/60"
                >
                  <th scope="row" className="py-2 font-medium text-zinc-900 dark:text-zinc-100">
                    {fact.label}
                  </th>
                  <td className="py-2 text-end">{fact.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>
      )}

      {usage && (
        <Section title="روش مصرف">
          <p className="whitespace-pre-line">{usage}</p>
        </Section>
      )}

      {warnings && (
        <Section title="هشدارها">
          <p className="whitespace-pre-line">{warnings}</p>
        </Section>
      )}
    </section>
  );
}
