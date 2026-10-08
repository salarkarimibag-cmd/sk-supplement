import type { Metadata } from "next";
import { Dumbbell, Target, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "درباره ما",
  description: "معرفی SK Supplement، فروشگاه آنلاین مکمل‌های ورزشی.",
};

const whyUs = [
  "مجموعه‌ای متنوع از پروتئین‌ها، پیش‌تمرین‌ها، آمینو اسیدها، ویتامین‌ها و مکمل‌های سلامت.",
  "ارسال رایگان به سراسر کشور.",
  "ضمانت بازگشت وجه در صورت معیوب یا اشتباه بودن سفارش.",
  "پشتیبانی مستقیم و پاسخ‌گو به سوالات مشتریان.",
];

export default function AboutUsPage() {
  return (
    <div>
      <div className="flex h-48 flex-col items-center justify-center gap-3 bg-linear-to-l from-sky-600 to-zinc-900 sm:h-60">
        <Dumbbell className="h-10 w-10 text-white/90 sm:h-12 sm:w-12" aria-hidden="true" />
        <h1 className="text-2xl font-bold text-white sm:text-3xl">درباره ما</h1>
      </div>

      <div className="mx-auto w-full max-w-3xl px-6 py-12">
        <p className="text-zinc-600 dark:text-zinc-400">
          SK Supplement با هدف در دسترس قرار دادن مکمل‌های ورزشی باکیفیت، همراه با مشاوره‌ی درست و قیمت منصفانه، راه‌اندازی شده است.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-zinc-200 p-5 dark:border-zinc-800">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-50 text-sky-600 dark:bg-sky-950 dark:text-sky-400">
                <Target className="h-5 w-5" aria-hidden="true" />
              </span>
              <h2 className="text-base font-bold">ماموریت ما</h2>
            </div>

            <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              ما معتقدیم هر ورزشکار، از تازه‌کار تا حرفه‌ای، باید بتواند بدون سردرگمی و با اطمینان از کیفیت محصول، مکمل موردنیاز خود را تهیه کند. برای همین تلاش می‌کنیم اطلاعات دقیق و شفاف درباره‌ی هر محصول در اختیار مشتریان قرار دهیم.
            </p>
          </div>

          <div className="rounded-xl border border-zinc-200 p-5 dark:border-zinc-800">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-50 text-sky-600 dark:bg-sky-950 dark:text-sky-400">
                <Sparkles className="h-5 w-5" aria-hidden="true" />
              </span>
              <h2 className="text-base font-bold">چرا SK Supplement؟</h2>
            </div>

            <ul className="mt-3 space-y-1.5 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              {whyUs.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-sky-600 dark:bg-sky-400" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="mt-8 text-zinc-600 dark:text-zinc-400">
          اگر سوالی درباره‌ی محصولات یا سفارش خود دارید، از طریق صفحه‌ی «تماس با ما» با ما در ارتباط باشید.
        </p>
      </div>
    </div>
  );
}
