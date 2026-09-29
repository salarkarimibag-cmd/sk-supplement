import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "حریم خصوصی",
  description: "سیاست حریم خصوصی و نحوه‌ی استفاده از اطلاعات کاربران در SK Supplement.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-12">
      <h1 className="text-2xl font-bold">حریم خصوصی</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        حفظ حریم خصوصی شما برای ما اهمیت دارد. این صفحه توضیح می‌دهد چه اطلاعاتی جمع‌آوری می‌شود و چگونه از آن استفاده می‌کنیم.
      </p>

      <h2 className="mt-8 text-lg font-bold">چه اطلاعاتی جمع‌آوری می‌کنیم</h2>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        هنگام ثبت‌نام، ثبت سفارش یا عضویت در خبرنامه، اطلاعاتی مانند نام، ایمیل، شماره موبایل و آدرس ارسال از شما دریافت می‌شود. اطلاعات پرداخت مستقیماً توسط درگاه زرین‌پال پردازش می‌شود و در سرورهای ما ذخیره نمی‌شود.
      </p>

      <h2 className="mt-8 text-lg font-bold">نحوه‌ی استفاده از اطلاعات</h2>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        اطلاعات شما صرفاً برای پردازش سفارش، ارسال کالا، پاسخ به درخواست‌های پشتیبانی و در صورت عضویت، ارسال ایمیل خبرنامه استفاده می‌شود.
      </p>

      <h2 className="mt-8 text-lg font-bold">اشتراک‌گذاری با اشخاص ثالث</h2>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        اطلاعات ضروری برای پردازش سفارش (مانند آدرس و شماره تماس) فقط با شرکت‌های حمل‌ونقل (پست/تیپاکس) و درگاه پرداخت به اشتراک گذاشته می‌شود. اطلاعات شما به هیچ شخص یا شرکت دیگری فروخته یا اجاره داده نمی‌شود.
      </p>

      <h2 className="mt-8 text-lg font-bold">حقوق شما</h2>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        در هر زمان می‌توانید درخواست مشاهده، اصلاح یا حذف اطلاعات حساب کاربری خود را از طریق صفحه‌ی «تماس با ما» ثبت کنید.
      </p>
    </div>
  );
}
