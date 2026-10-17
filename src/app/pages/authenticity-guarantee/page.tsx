import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, MessageCircle, PackageCheck, Wallet } from "lucide-react";

export const metadata: Metadata = {
  title: "ضمانت اصالت کالا",
  description: "ضمانت اصالت محصولات فروشگاه SK Supplement و بازگشت کامل وجه برای کالای غیراصل.",
};

// Same layout as the refund policy page. The refund timing matches that page,
// so keep the two in sync if either changes.
const sections = [
  {
    icon: PackageCheck,
    title: "همه‌ی محصولات اصل هستن",
    stat: null,
    body: "هر محصولی که از SK Supplement می‌خرید اصله. اصالت مکمل‌ها مستقیم به سلامت شما مربوطه، برای همین روی این موضوع کوتاه نمیایم.",
  },
  {
    icon: MessageCircle,
    title: "اگه به اصالت محصول شک داشتید",
    stat: null,
    body: "از صفحه‌ی تماس با ما، شماره‌ی سفارش و چندتا عکس واضح از محصول و بسته‌بندیش رو برامون بفرستید تا بررسی کنیم.",
  },
  {
    icon: BadgeCheck,
    title: "بازگشت کامل وجه",
    stat: "۱۰۰٪",
    body: "اگه غیراصل بودن محصول تأیید بشه، کل مبلغ اون کالا رو به‌همراه هزینه‌ی ارسال برگشتش بهتون برمی‌گردونیم.",
  },
  {
    icon: Wallet,
    title: "نحوه و زمان بازگشت وجه",
    stat: "۷ تا ۱۴ روز کاری",
    body: "مبلغ از همون روش پرداختی که استفاده کردید، طی ۷ تا ۱۴ روز کاری بعد از تأیید، بهتون برمی‌گرده.",
  },
];

export default function AuthenticityGuaranteePage() {
  return (
    <div>
      <div className="flex h-48 flex-col items-center justify-center gap-3 bg-linear-to-l from-sky-600 to-zinc-900 sm:h-60">
        <BadgeCheck className="h-10 w-10 text-white/90 sm:h-12 sm:w-12" aria-hidden="true" />
        <h1 className="text-2xl font-bold text-white sm:text-3xl">ضمانت اصالت کالا</h1>
      </div>

      <div className="mx-auto w-full max-w-3xl px-6 py-12">
        <p className="text-zinc-600 dark:text-zinc-400">
          با خیال راحت خرید کنید. این چهار نکته توضیح می‌ده اصالت محصولات ما رو چطور تضمین می‌کنیم و
          اگه مشکلی پیش اومد چه کاری انجام می‌دیم.
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

        <p className="mt-8 text-sm text-zinc-600 dark:text-zinc-400">
          برای ثبت درخواست، به صفحه‌ی{" "}
          <Link href="/pages/contact-us" className="text-sky-600 hover:underline dark:text-sky-400">
            تماس با ما
          </Link>{" "}
          برید.
        </p>
      </div>
    </div>
  );
}
