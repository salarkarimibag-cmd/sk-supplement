import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "دسترس‌پذیری",
  description: "اطلاعات دسترس‌پذیری فروشگاه SK Supplement.",
};

export default function AccessibilityPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-12">
      <h1 className="text-2xl font-bold">دسترس‌پذیری</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        SK Supplement تلاش می‌کند تجربه‌ی خریدی قابل‌استفاده برای همه‌ی کاربران، صرف‌نظر از توانایی‌ها یا ابزار مورداستفاده‌شان، فراهم کند.
      </p>

      <h2 className="mt-8 text-lg font-bold">امکانات فعلی</h2>
      <ul className="mt-2 list-inside list-disc space-y-1 text-zinc-600 dark:text-zinc-400">
        <li>حالت تیره و روشن برای راحتی چشم در شرایط نوری مختلف.</li>
        <li>متن جایگزین برای تصاویر محصولات جهت استفاده با صفحه‌خوان‌ها.</li>
        <li>امکان پیمایش سایت با صفحه‌کلید.</li>
      </ul>

      <h2 className="mt-8 text-lg font-bold">بهبود مستمر</h2>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        دسترس‌پذیری یک فرآیند مداوم است و ما به‌طور مستمر در حال بررسی و بهبود سایت در این زمینه هستیم.
      </p>

      <h2 className="mt-8 text-lg font-bold">گزارش مشکل</h2>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        اگر با مشکلی در استفاده از سایت مواجه شدید که به دسترس‌پذیری مربوط می‌شود، لطفاً از طریق صفحه‌ی «تماس با ما» به ما اطلاع دهید تا آن را بررسی کنیم.
      </p>
    </div>
  );
}
