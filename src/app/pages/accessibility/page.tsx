import type { Metadata } from "next";
import { Accessibility, Eye, RefreshCw, MessageCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "دسترس‌پذیری",
  description: "اطلاعات دسترس‌پذیری فروشگاه SK Supplement.",
};

const features = [
  "حالت تیره و روشن برای راحتی چشم در شرایط نوری مختلف.",
  "متن جایگزین برای تصاویر محصولات جهت استفاده با صفحه‌خوان‌ها.",
  "امکان پیمایش سایت با صفحه‌کلید.",
];

const sections = [
  {
    icon: RefreshCw,
    title: "بهبود مستمر",
    body: "دسترس‌پذیری یک فرآیند مداوم است و ما به‌طور مستمر در حال بررسی و بهبود سایت در این زمینه هستیم.",
  },
  {
    icon: MessageCircle,
    title: "گزارش مشکل",
    body: "اگر با مشکلی در استفاده از سایت مواجه شدید که به دسترس‌پذیری مربوط می‌شود، لطفاً از طریق صفحه‌ی «تماس با ما» به ما اطلاع دهید تا آن را بررسی کنیم.",
  },
];

export default function AccessibilityPage() {
  return (
    <div>
      <div className="flex h-48 flex-col items-center justify-center gap-3 bg-linear-to-l from-sky-600 to-zinc-900 sm:h-60">
        <Accessibility className="h-10 w-10 text-white/90 sm:h-12 sm:w-12" aria-hidden="true" />
        <h1 className="text-2xl font-bold text-white sm:text-3xl">دسترس‌پذیری</h1>
      </div>

      <div className="mx-auto w-full max-w-3xl px-6 py-12">
        <p className="text-zinc-600 dark:text-zinc-400">
          SK Supplement تلاش می‌کند تجربه‌ی خریدی قابل‌استفاده برای همه‌ی کاربران، صرف‌نظر از توانایی‌ها یا ابزار مورداستفاده‌شان، فراهم کند.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-zinc-200 p-5 dark:border-zinc-800">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-50 text-sky-600 dark:bg-sky-950 dark:text-sky-400">
                <Eye className="h-5 w-5" aria-hidden="true" />
              </span>
              <h2 className="text-base font-bold">امکانات فعلی</h2>
            </div>

            <ul className="mt-3 space-y-1.5 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              {features.map((feature) => (
                <li key={feature} className="flex gap-2">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-sky-600 dark:bg-sky-400" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {sections.map((section) => (
            <div
              key={section.title}
              className="rounded-xl border border-zinc-200 p-5 dark:border-zinc-800"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-50 text-sky-600 dark:bg-sky-950 dark:text-sky-400">
                  <section.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h2 className="text-base font-bold">{section.title}</h2>
              </div>

              <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                {section.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
