import type { Metadata } from "next";
import { Truck, Clock, BadgePercent, Map, MapPinned } from "lucide-react";
import { pageMetadata } from "@/lib/seo";
import { FREE_SHIPPING_MIN_LABEL, shippingFeeTiers } from "@/lib/shipping";

export const metadata: Metadata = pageMetadata({
  title: "قوانین ارسال",
  description: "قوانین و زمان‌بندی ارسال سفارش‌ها در SK Supplement.",
  path: "/pages/shipping-policy",
});

const sections = [
  {
    icon: Clock,
    title: "زمان تحویل",
    stat: "۲ تا ۷ روز کاری",
    body: "سفارش‌های ثبت‌شده در تهران طی ۲ تا ۵ روز کاری، و سفارش‌های شهرستان‌ها طی ۳ تا ۷ روز کاری پس از ثبت سفارش تحویل داده می‌شوند.",
  },
  {
    icon: BadgePercent,
    title: "هزینه ارسال",
    stat: `رایگان بالای ${FREE_SHIPPING_MIN_LABEL}`,
    body: `ارسال سفارش‌هایی که مبلغ کالاهای آن‌ها (پس از کسر تخفیف) ${FREE_SHIPPING_MIN_LABEL} یا بیشتر باشد، در سراسر کشور رایگان است. برای سفارش‌های کمتر از این مبلغ، هزینه‌ی ارسال به استان مقصد بستگی دارد (فهرست زیر) و پیش از پرداخت در صفحه‌ی تسویه حساب نمایش داده می‌شود.`,
  },
  {
    icon: MapPinned,
    title: "نحوه ارسال و رهگیری مرسوله",
    stat: null,
    body: "سفارش‌ها از طریق پست یا تیپاکس ارسال می‌شوند. پس از ارسال، کد رهگیری مرسوله را به شماره موبایل یا ایمیلی که هنگام ثبت سفارش وارد کرده‌اید برایتان می‌فرستیم تا بتوانید وضعیت تحویل را پیگیری کنید.",
  },
];

export default function ShippingPolicyPage() {
  return (
    <div>
      <div className="flex h-48 flex-col items-center justify-center gap-3 bg-linear-to-l from-sky-600 to-zinc-900 sm:h-60">
        <Truck className="h-10 w-10 text-white/90 sm:h-12 sm:w-12" aria-hidden="true" />
        <h1 className="text-2xl font-bold text-white sm:text-3xl">قوانین ارسال</h1>
      </div>

      <div className="mx-auto w-full max-w-3xl px-6 py-12">
        <p className="text-zinc-600 dark:text-zinc-400">
          اطلاعات زیر مربوط به زمان‌بندی، هزینه و نحوه‌ی ارسال سفارش‌های شماست.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {sections.map((section) => (
            <div
              key={section.title}
              // A card left alone on the last row of the two columns takes
              // the whole row instead of leaving a gap beside it.
              className="rounded-xl border border-zinc-200 p-5 sm:odd:last:col-span-2 dark:border-zinc-800"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-50 text-sky-600 dark:bg-sky-950 dark:text-sky-400">
                  <section.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h2 className="text-base font-bold">{section.title}</h2>
              </div>

              {section.stat && (
                <p className="mt-3 text-xl font-extrabold text-sky-600 dark:text-sky-400">
                  {section.stat}
                </p>
              )}

              <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                {section.body}
              </p>
            </div>
          ))}
        </div>

        {/* Same card style as the sections above, full width for the list. */}
        <section className="mt-4 rounded-xl border border-zinc-200 p-5 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-50 text-sky-600 dark:bg-sky-950 dark:text-sky-400">
              <Map className="h-5 w-5" aria-hidden="true" />
            </span>
            <h2 className="text-base font-bold">هزینه‌ی ارسال هر استان</h2>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            برای سفارش‌های کمتر از {FREE_SHIPPING_MIN_LABEL}؛ سفارش‌ها از تهران ارسال می‌شوند.
          </p>

          <ul className="mt-4 divide-y divide-zinc-100 dark:divide-zinc-800">
            {shippingFeeTiers().map(([fee, provinces]) => (
              <li
                key={fee}
                className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
              >
                <span className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                  {provinces.join("، ")}
                </span>
                <span className="w-fit shrink-0 rounded-full bg-sky-50 px-3 py-1 text-sm font-bold whitespace-nowrap text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                  {fee.toLocaleString("fa-IR")} تومان
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
