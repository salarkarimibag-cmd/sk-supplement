import type { Metadata } from "next";
import { ShieldCheck, Database, Settings2, Share2, UserCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "حریم خصوصی",
  description: "سیاست حریم خصوصی و نحوه‌ی استفاده از اطلاعات کاربران در SK Supplement.",
};

const sections = [
  {
    icon: Database,
    title: "چه اطلاعاتی جمع‌آوری می‌کنیم",
    body: "هنگام ثبت‌نام، ثبت سفارش یا عضویت در خبرنامه، اطلاعاتی مانند نام، ایمیل، شماره موبایل و آدرس ارسال از شما دریافت می‌شود. اطلاعات پرداخت مستقیماً توسط درگاه زرین‌پال پردازش می‌شود و در سرورهای ما ذخیره نمی‌شود.",
  },
  {
    icon: Settings2,
    title: "نحوه‌ی استفاده از اطلاعات",
    body: "اطلاعات شما صرفاً برای پردازش سفارش، ارسال کالا، پاسخ به درخواست‌های پشتیبانی و در صورت عضویت، ارسال ایمیل خبرنامه استفاده می‌شود.",
  },
  {
    icon: Share2,
    title: "اشتراک‌گذاری با اشخاص ثالث",
    body: "اطلاعات ضروری برای پردازش سفارش (مانند آدرس و شماره تماس) فقط با شرکت‌های حمل‌ونقل (پست/تیپاکس) و درگاه پرداخت به اشتراک گذاشته می‌شود. اطلاعات شما به هیچ شخص یا شرکت دیگری فروخته یا اجاره داده نمی‌شود.",
  },
  {
    icon: UserCheck,
    title: "حقوق شما",
    body: "در هر زمان می‌توانید درخواست مشاهده، اصلاح یا حذف اطلاعات حساب کاربری خود را از طریق صفحه‌ی «تماس با ما» ثبت کنید.",
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div>
      <div className="flex h-48 flex-col items-center justify-center gap-3 bg-linear-to-l from-sky-600 to-zinc-900 sm:h-60">
        <ShieldCheck className="h-10 w-10 text-white/90 sm:h-12 sm:w-12" aria-hidden="true" />
        <h1 className="text-2xl font-bold text-white sm:text-3xl">حریم خصوصی</h1>
      </div>

      <div className="mx-auto w-full max-w-3xl px-6 py-12">
        <p className="text-zinc-600 dark:text-zinc-400">
          حفظ حریم خصوصی شما برای ما اهمیت دارد. این صفحه توضیح می‌دهد چه اطلاعاتی جمع‌آوری می‌شود و چگونه از آن استفاده می‌کنیم.
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
