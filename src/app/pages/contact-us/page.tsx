import type { Metadata } from "next";
import ContactForm from "@/components/contact/ContactForm";

export const metadata: Metadata = {
  title: "تماس با ما",
  description: "راه‌های ارتباط با تیم پشتیبانی SK Supplement.",
};

export default function ContactUsPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-12">
      <h1 className="text-2xl font-bold">تماس با ما</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        سوالی دارید یا نیاز به راهنمایی دارید؟ از راه‌های زیر با ما در ارتباط باشید.
      </p>

      <dl className="mt-6 flex flex-col gap-3 text-sm">
        <div className="flex gap-2">
          <dt className="font-bold text-zinc-900 dark:text-zinc-100">ایمیل:</dt>
          <dd className="text-zinc-600 dark:text-zinc-400">salarkarimi.bag@gmail.com</dd>
        </div>
        <div className="flex gap-2">
          <dt className="font-bold text-zinc-900 dark:text-zinc-100">تلفن:</dt>
          <dd dir="ltr" className="text-right text-zinc-600 dark:text-zinc-400">
            ۰۹۱۸۵۵۶۶۵۱۴
          </dd>
        </div>
        <div className="flex gap-2">
          <dt className="font-bold text-zinc-900 dark:text-zinc-100">آدرس:</dt>
          <dd className="text-zinc-600 dark:text-zinc-400">
            کرمانشاه، صحنه، روستای دسجرده سفلی
          </dd>
        </div>
      </dl>

      <h2 className="mt-8 text-lg font-bold">ارسال پیام</h2>
      <ContactForm />
    </div>
  );
}
