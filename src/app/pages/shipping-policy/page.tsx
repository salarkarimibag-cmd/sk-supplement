import type { Metadata } from "next";
import { Truck, Clock, BadgePercent, MapPinned } from "lucide-react";

export const metadata: Metadata = {
  title: "قوانین ارسال",
  description: "قوانین و زمان‌بندی ارسال سفارش‌ها در SK Supplement.",
};

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
    stat: "رایگان",
    body: "ارسال تمامی سفارش‌ها، در سراسر کشور و بدون محدودیت مبلغ خرید، کاملاً رایگان است.",
  },
  {
    icon: MapPinned,
    title: "نحوه ارسال و رهگیری مرسوله",
    stat: null,
    body: "سفارش‌ها از طریق پست یا تیپاکس ارسال می‌شوند. بلافاصله پس از ارسال، کد رهگیری مرسوله از طریق پیامک برای شما ارسال خواهد شد تا بتوانید وضعیت تحویل را پیگیری کنید.",
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
              className="rounded-xl border border-zinc-200 p-5 dark:border-zinc-800"
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
      </div>
    </div>
  );
}
