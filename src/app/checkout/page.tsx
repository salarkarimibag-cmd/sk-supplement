// TODO: submit the order to /api/orders, then redirect to /api/payment (ZarinPal).
export default function CheckoutPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12">
      <h1 className="text-2xl font-bold">تسویه حساب</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">فرم پرداخت به‌زودی اضافه می‌شود.</p>
    </div>
  );
}
