import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "درباره ما",
  description: "معرفی SK Supplement، فروشگاه آنلاین مکمل‌های ورزشی.",
};

export default function AboutUsPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-12">
      <h1 className="text-2xl font-bold">درباره ما</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        SK Supplement با هدف در دسترس قرار دادن مکمل‌های ورزشی باکیفیت، همراه با مشاوره‌ی درست و قیمت منصفانه، راه‌اندازی شده است.
      </p>

      <h2 className="mt-8 text-lg font-bold">ماموریت ما</h2>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        ما معتقدیم هر ورزشکار، از تازه‌کار تا حرفه‌ای، باید بتواند بدون سردرگمی و با اطمینان از کیفیت محصول، مکمل موردنیاز خود را تهیه کند. برای همین تلاش می‌کنیم اطلاعات دقیق و شفاف درباره‌ی هر محصول در اختیار مشتریان قرار دهیم.
      </p>

      <h2 className="mt-8 text-lg font-bold">چرا SK Supplement؟</h2>
      <ul className="mt-2 list-inside list-disc space-y-1 text-zinc-600 dark:text-zinc-400">
        <li>مجموعه‌ای متنوع از پروتئین‌ها، پیش‌تمرین‌ها، آمینو اسیدها، ویتامین‌ها و مکمل‌های سلامت.</li>
        <li>ارسال رایگان به سراسر کشور.</li>
        <li>ضمانت بازگشت وجه در صورت معیوب یا اشتباه بودن سفارش.</li>
        <li>پشتیبانی مستقیم و پاسخ‌گو به سوالات مشتریان.</li>
      </ul>

      <p className="mt-8 text-zinc-600 dark:text-zinc-400">
        اگر سوالی درباره‌ی محصولات یا سفارش خود دارید، از طریق صفحه‌ی «تماس با ما» با ما در ارتباط باشید.
      </p>
    </div>
  );
}
