import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "قوانین بازگشت وجه",
  description: "قوانین و شرایط بازگشت وجه در فروشگاه SK Supplement.",
};

export default function RefundPolicyPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-12">
      <h1 className="text-2xl font-bold">قوانین بازگشت وجه</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        رضایت شما برای ما اهمیت دارد. لطفاً پیش از ثبت درخواست بازگشت کالا، شرایط زیر را مطالعه کنید.
      </p>

      <h2 className="mt-8 text-lg font-bold">مهلت بازگشت</h2>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        درخواست بازگشت کالا باید حداکثر تا ۷ روز پس از تحویل گرفتن مرسوله ثبت شود.
      </p>

      <h2 className="mt-8 text-lg font-bold">شرایط پذیرش بازگشت</h2>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        از آنجا که محصولات این فروشگاه مکمل غذایی هستند، بازگشت کالا فقط در موارد زیر پذیرفته می‌شود:
      </p>
      <ul className="mt-2 list-inside list-disc space-y-1 text-zinc-600 dark:text-zinc-400">
        <li>کالای دریافتی معیوب یا آسیب‌دیده باشد.</li>
        <li>کالای ارسالی با سفارش ثبت‌شده مطابقت نداشته باشد (ارسال اشتباه).</li>
      </ul>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        به دلیل ماهیت خوراکی و بهداشتی محصولات، بازگشت کالا صرفاً به دلیل انصراف یا تغییر نظر مشتری امکان‌پذیر نیست.
      </p>

      <h2 className="mt-8 text-lg font-bold">هزینه ارسال مرجوعی</h2>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        هزینه ارسال کالای مرجوعی بر عهده مشتری است، مگر آنکه دلیل بازگشت، اشتباه یا مسئولیت فروشگاه باشد؛ در این صورت هزینه ارسال توسط فروشگاه پرداخت می‌شود.
      </p>

      <h2 className="mt-8 text-lg font-bold">نحوه و زمان بازگشت وجه</h2>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        پس از تأیید بازگشت کالا، مبلغ پرداختی از همان روش پرداخت اولیه شما، طی ۷ تا ۱۴ روز کاری بازگردانده می‌شود.
      </p>
    </div>
  );
}
