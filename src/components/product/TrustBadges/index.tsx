import Link from "next/link";
import { RotateCcw, ShieldCheck, Truck } from "lucide-react";

// Each claim mirrors a policy page, so keep the wording in sync with it.
// Exported so the home hero shows the same claims in its own layout.
export const trustBadges = [
  {
    icon: Truck,
    title: "ارسال رایگان سراسری",
    detail: "تحویل ۲ تا ۷ روز کاری",
    href: "/pages/shipping-policy",
  },
  {
    icon: RotateCcw,
    title: "۷ روز مهلت بازگشت",
    detail: "برای کالای معیوب یا ارسال اشتباه",
    href: "/pages/refund-policy",
  },
  {
    icon: ShieldCheck,
    title: "پرداخت امن",
    detail: "درگاه زرین‌پال یا کارت‌به‌کارت",
    href: "/pages/faq",
  },
];

export default function TrustBadges() {
  return (
    <ul className="grid gap-3 border-t border-zinc-200 pt-6 sm:grid-cols-3 dark:border-zinc-800">
      {trustBadges.map(({ icon: Icon, title, detail, href }) => (
        <li key={href}>
          <Link
            href={href}
            className="group flex items-center gap-3 rounded-sm sm:flex-col sm:items-start sm:gap-2"
          >
            <Icon aria-hidden="true" className="h-6 w-6 shrink-0 text-sky-600" />
            <span>
              <span className="block text-sm font-bold transition-colors group-hover:text-sky-600">
                {title}
              </span>
              <span className="block text-xs text-zinc-500 dark:text-zinc-400">{detail}</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
