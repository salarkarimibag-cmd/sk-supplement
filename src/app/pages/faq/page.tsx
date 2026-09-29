import type { Metadata } from "next";

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
    <div className="mx-auto w-full max-w-3xl px-6 py-12">
      <h1 className="text-2xl font-bold">سوالات متداول</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        پاسخ پرتکرارترین سوالات درباره‌ی خرید، ارسال و بازگشت کالا.
      </p>

      <div className="mt-8 flex flex-col gap-6">
        {faqs.map((item) => (
          <div key={item.question}>
            <h2 className="text-base font-bold">{item.question}</h2>
            <p className="mt-1 text-zinc-600 dark:text-zinc-400">{item.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
