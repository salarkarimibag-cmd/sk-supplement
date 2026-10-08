import type { Metadata } from "next";
import { Undo2, Clock, ShieldCheck, Truck, Wallet } from "lucide-react";

export const metadata: Metadata = {
  title: "قوانین بازگشت وجه",
  description: "قوانین و شرایط بازگشت وجه در فروشگاه SK Supplement.",
};

const sections = [
  {
    icon: Clock,
    title: "مهلت بازگشت",
    stat: "۷ روز",
    body: "همین که مرسوله به دستتون رسید، ۷ روز وقت دارید تا در صورت نیاز، درخواست بازگشتش رو ثبت کنید. بعد از این مهلت، متأسفانه امکان پذیرش درخواست نیست.",
  },
  {
    icon: ShieldCheck,
    title: "چه کالاهایی برمی‌گردن؟",
    stat: null,
    body: "چون محصولات ما خوراکی و بهداشتی‌ان، فقط در دو حالت بازگشت رو می‌پذیریم: کالا معیوب یا آسیب‌دیده به دستتون رسیده باشه، یا اشتباهی چیزی غیر از سفارشتون براتون ارسال شده باشه. به‌خاطر ماهیت این محصولات، صرفِ تغییر نظر یا انصراف از خرید، دلیل کافی برای بازگشت نیست.",
  },
  {
    icon: Truck,
    title: "هزینه ارسال مرجوعی",
    stat: null,
    body: "اگه اشتباه از طرف ما بوده (کالای معیوب یا ارسال اشتباه)، هزینه‌ی برگردوندن مرسوله رو خودمون پرداخت می‌کنیم. در غیر این صورت، هزینه ارسال مرجوعی بر عهده‌ی شماست.",
  },
  {
    icon: Wallet,
    title: "نحوه و زمان بازگشت وجه",
    stat: "۷ تا ۱۴ روز کاری",
    body: "به‌محض تأیید بازگشت کالا، مبلغ رو از همون روش پرداختی که استفاده کردید، طی ۷ تا ۱۴ روز کاری بهتون برمی‌گردونیم.",
  },
];

export default function RefundPolicyPage() {
  return (
    <div>
      <div className="flex h-48 flex-col items-center justify-center gap-3 bg-linear-to-l from-sky-600 to-zinc-900 sm:h-60">
        <Undo2 className="h-10 w-10 text-white/90 sm:h-12 sm:w-12" aria-hidden="true" />
        <h1 className="text-2xl font-bold text-white sm:text-3xl">قوانین بازگشت وجه</h1>
      </div>

      <div className="mx-auto w-full max-w-3xl px-6 py-12">
        <p className="text-zinc-600 dark:text-zinc-400">
          رضایت شما برای ما مهمه. قبل از ثبت درخواست بازگشت کالا، یه نگاه به این چهار نکته بندازید تا
          مسیر برگشت کالا براتون روشن باشه.
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
