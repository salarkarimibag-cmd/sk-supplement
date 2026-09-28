import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "قوانین ارسال",
  description: "قوانین و زمان‌بندی ارسال سفارش‌ها در SK Supplement.",
};

export default function ShippingPolicyPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-12">
      <h1 className="text-2xl font-bold">قوانین ارسال</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        اطلاعات زیر مربوط به زمان‌بندی، هزینه و نحوه‌ی ارسال سفارش‌های شماست.
      </p>

      <h2 className="mt-8 text-lg font-bold">زمان تحویل</h2>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        سفارش‌های ثبت‌شده در تهران طی ۲ تا ۵ روز کاری، و سفارش‌های شهرستان‌ها طی ۳ تا ۷ روز کاری پس از ثبت سفارش تحویل داده می‌شوند.
      </p>

      <h2 className="mt-8 text-lg font-bold">هزینه ارسال</h2>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        ارسال تمامی سفارش‌ها، در سراسر کشور و بدون محدودیت مبلغ خرید، کاملاً رایگان است.
      </p>

      <h2 className="mt-8 text-lg font-bold">نحوه ارسال و رهگیری مرسوله</h2>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        سفارش‌ها از طریق پست یا تیپاکس ارسال می‌شوند. بلافاصله پس از ارسال، کد رهگیری مرسوله از طریق پیامک برای شما ارسال خواهد شد تا بتوانید وضعیت تحویل را پیگیری کنید.
      </p>
    </div>
  );
}
