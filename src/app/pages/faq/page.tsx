import type { Metadata } from "next";
import { CircleHelp } from "lucide-react";

export const metadata: Metadata = {
  title: "سوالات متداول",
  description: "پاسخ سوالات متداول درباره‌ی خرید، ارسال و محصولات SK Supplement.",
};

const faqs = [
  {
    question: "چطور سفارش ثبت کنم؟",
    answer:
      "محصول موردنظر را به سبد خرید اضافه کنید، وارد صفحه‌ی تسویه‌حساب شوید، اطلاعات ارسال را وارد کنید و پرداخت را نهایی کنید. پس از تأیید پرداخت، سفارش شما ثبت می‌شود.",
  },
  {
    question: "روش‌های پرداخت چیست؟",
    answer: "پرداخت به‌صورت آنلاین و امن از طریق درگاه زرین‌پال انجام می‌شود.",
  },
  {
    question: "هزینه و زمان ارسال چقدر است؟",
    answer:
      "ارسال تمامی سفارش‌ها در سراسر کشور رایگان است. زمان تحویل در تهران ۲ تا ۵ روز کاری و در سایر شهرها ۳ تا ۷ روز کاری است.",
  },
  {
    question: "آیا امکان بازگشت کالا وجود دارد؟",
    answer:
      "در صورت معیوب یا آسیب‌دیده بودن کالا، یا ارسال اشتباه، تا ۷ روز پس از تحویل امکان ثبت درخواست بازگشت وجود دارد.",
  },
  {
    question: "کد تخفیف را چطور اعمال کنم؟",
    answer: "کد تخفیف را در صفحه‌ی تسویه‌حساب، در بخش مربوطه وارد کرده و اعمال کنید.",
  },
  {
    question: "چطور با پشتیبانی تماس بگیرم؟",
    answer: "برای هرگونه سوال یا مشکل، از طریق صفحه‌ی «تماس با ما» با تیم پشتیبانی در ارتباط باشید.",
  },
];

export default function FaqPage() {
  return (
    <div>
      <div className="flex h-48 flex-col items-center justify-center gap-3 bg-linear-to-l from-sky-600 to-zinc-900 sm:h-60">
        <CircleHelp className="h-10 w-10 text-white/90 sm:h-12 sm:w-12" aria-hidden="true" />
        <h1 className="text-2xl font-bold text-white sm:text-3xl">سوالات متداول</h1>
      </div>

      <div className="mx-auto w-full max-w-3xl px-6 py-12">
        <p className="text-zinc-600 dark:text-zinc-400">
          پاسخ پرتکرارترین سوالات درباره‌ی خرید، ارسال و بازگشت کالا.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {faqs.map((item) => (
            <div
              key={item.question}
              className="rounded-xl border border-zinc-200 p-5 dark:border-zinc-800"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-50 text-sky-600 dark:bg-sky-950 dark:text-sky-400">
                  <CircleHelp className="h-5 w-5" aria-hidden="true" />
                </span>
                <h2 className="text-base font-bold">{item.question}</h2>
              </div>

              <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                {item.answer}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
