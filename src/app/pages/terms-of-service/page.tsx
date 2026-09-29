import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "قوانین و مقررات",
  description: "قوانین و مقررات استفاده از فروشگاه SK Supplement.",
};

export default function TermsOfServicePage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-12">
      <h1 className="text-2xl font-bold">قوانین و مقررات</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        استفاده از فروشگاه SK Supplement به معنای پذیرش قوانین و مقررات زیر است.
      </p>

      <h2 className="mt-8 text-lg font-bold">حساب کاربری</h2>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        حفظ محرمانگی اطلاعات ورود (ایمیل و رمز عبور) بر عهده‌ی کاربر است. مسئولیت هرگونه فعالیتی که با حساب کاربری شما انجام شود، بر عهده‌ی شماست.
      </p>

      <h2 className="mt-8 text-lg font-bold">محصولات و قیمت‌گذاری</h2>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        تلاش می‌کنیم اطلاعات و قیمت محصولات را به‌روز و دقیق نگه داریم، اما در صورت بروز خطای فنی در ثبت قیمت یا موجودی، فروشگاه حق دارد سفارش را پیش از پردازش نهایی لغو و مبلغ پرداختی را عودت دهد.
      </p>

      <h2 className="mt-8 text-lg font-bold">ثبت و لغو سفارش</h2>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        ثبت سفارش به منزله‌ی درخواست خرید است، نه تعهد قطعی فروشگاه به تحویل. فروشگاه در موارد استثنایی (مانند اتمام موجودی یا مغایرت اطلاعات پرداخت) می‌تواند سفارش را لغو کند و مراتب را به مشتری اطلاع دهد.
      </p>

      <h2 className="mt-8 text-lg font-bold">مالکیت معنوی</h2>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        تمامی محتوای این وب‌سایت، شامل متن، تصاویر و لوگو، متعلق به SK Supplement است و استفاده یا بازنشر آن بدون اجازه‌ی کتبی مجاز نیست.
      </p>

      <h2 className="mt-8 text-lg font-bold">محدودیت مسئولیت</h2>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        محصولات این فروشگاه مکمل غذایی هستند و جایگزین رژیم غذایی متنوع و متعادل نمی‌شوند. مصرف هر مکملی، به‌ویژه در صورت داشتن بیماری خاص یا بارداری، باید با مشورت پزشک انجام شود.
      </p>

      <h2 className="mt-8 text-lg font-bold">تغییر قوانین</h2>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        این قوانین ممکن است به‌مرور زمان به‌روزرسانی شوند. استفاده‌ی مستمر شما از سایت پس از اعمال تغییرات، به معنای پذیرش نسخه‌ی جدید است.
      </p>
    </div>
  );
}
