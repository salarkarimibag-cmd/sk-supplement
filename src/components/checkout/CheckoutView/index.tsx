"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";

const checkoutSchema = z.object({
  email: z.string().min(1, "ایمیل الزامی است.").email("ایمیل نامعتبر است."),
  firstName: z.string().min(1, "نام الزامی است."),
  lastName: z.string().min(1, "نام خانوادگی الزامی است."),
  province: z.string().min(1, "استان الزامی است."),
  city: z.string().min(1, "شهر الزامی است."),
  address: z.string().min(1, "آدرس الزامی است."),
  postalCode: z.string().min(1, "کد پستی الزامی است."),
  mobile: z.string().min(10, "شماره موبایل نامعتبر است."),
});

type CheckoutValues = z.infer<typeof checkoutSchema>;

const inputClass =
  "w-full rounded border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-sky-600 dark:border-zinc-700 dark:bg-zinc-900";

function CheckoutLogo() {
  return (
    <div className="pb-6">
      <Link href="/" className="inline-flex items-center">
        <Image src="/images/logo-checkout.webp" alt="SK Supplement" width={746} height={424} className="h-24 w-auto" />
      </Link>
    </div>
  );
}

interface AppliedDiscount {
  code: string;
  amount: number;
}

export default function CheckoutView() {
  const { items, totalPrice, totalCount } = useCart();
  const [serverError, setServerError] = useState<string | null>(null);
  const [discountCodeInput, setDiscountCodeInput] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<AppliedDiscount | null>(null);
  const [discountError, setDiscountError] = useState<string | null>(null);
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutValues>({ resolver: zodResolver(checkoutSchema) });

  const finalTotal = totalPrice - (appliedDiscount?.amount ?? 0);

  async function handleApplyDiscount() {
    if (!discountCodeInput.trim()) return;
    setIsApplyingDiscount(true);
    setDiscountError(null);

    try {
      const response = await fetch("/api/discounts/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: discountCodeInput, subtotal: totalPrice }),
      });
      const data = await response.json();

      if (!data.valid) {
        setAppliedDiscount(null);
        setDiscountError(data.message ?? "کد تخفیف نامعتبر است.");
        return;
      }

      setAppliedDiscount({ code: data.code, amount: data.discountAmount });
    } catch {
      setDiscountError("خطایی در اعمال کد تخفیف رخ داد.");
    } finally {
      setIsApplyingDiscount(false);
    }
  }

  async function onSubmit(values: CheckoutValues) {
    setServerError(null);

    try {
      const response = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: finalTotal,
          discountCode: appliedDiscount?.code,
          discountAmount: appliedDiscount?.amount,
          contact: { email: values.email, mobile: values.mobile },
          shippingAddress: {
            firstName: values.firstName,
            lastName: values.lastName,
            province: values.province,
            city: values.city,
            address: values.address,
            postalCode: values.postalCode,
          },
          items: items.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
            unitPrice: item.price,
          })),
        }),
      });
      const data = await response.json();

      if (!response.ok || !data.url) {
        setServerError(data.message ?? "اتصال به درگاه پرداخت زرین‌پال ناموفق بود.");
        return;
      }

      // eslint-disable-next-line react-hooks/immutability -- real navigation to an external payment gateway, not a render-phase mutation
      window.location.href = data.url;
    } catch {
      setServerError("خطایی در اتصال به درگاه پرداخت رخ داد.");
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto w-full max-w-3xl px-6 py-16 text-center">
        <CheckoutLogo />
        <h1 className="mt-10 text-2xl font-bold">تسویه حساب</h1>
        <p className="mt-3 text-zinc-600 dark:text-zinc-400">سبد خرید شما خالی است.</p>
        <Link
          href="/"
          className="mt-6 inline-block rounded bg-sky-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-sky-500"
        >
          بازگشت به فروشگاه
        </Link>
      </div>
    );
  }

  return (
    <div className="lg:grid lg:grid-cols-2">
      <h1 className="sr-only">تسویه حساب</h1>

      <div className="relative bg-[rgb(255_255_255)] px-6 py-12 dark:bg-zinc-950">
      <Link
        href="/cart"
        aria-label="سبد خرید"
        className="absolute top-6 left-6 flex h-11 w-11 items-center justify-center rounded-full bg-sky-600 text-white shadow-sm transition hover:bg-sky-500"
      >
        <ShoppingBag className="h-5 w-5" />
        {totalCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-[10px] font-bold text-zinc-900">
            {totalCount}
          </span>
        )}
      </Link>
      <div className="mx-auto max-w-xl">
      <CheckoutLogo />
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-10 flex flex-col gap-8">
        <div>
          <h2 className="text-lg font-bold">اطلاعات تماس</h2>
          <div className="mt-3">
            <input type="email" placeholder="ایمیل" {...register("email")} className={inputClass} />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-bold">اطلاعات ارسال</h2>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <input type="text" placeholder="نام" {...register("firstName")} className={inputClass} />
              {errors.firstName && (
                <p className="mt-1 text-xs text-red-600">{errors.firstName.message}</p>
              )}
            </div>
            <div>
              <input
                type="text"
                placeholder="نام خانوادگی"
                {...register("lastName")}
                className={inputClass}
              />
              {errors.lastName && (
                <p className="mt-1 text-xs text-red-600">{errors.lastName.message}</p>
              )}
            </div>
            <div>
              <input type="text" placeholder="استان" {...register("province")} className={inputClass} />
              {errors.province && (
                <p className="mt-1 text-xs text-red-600">{errors.province.message}</p>
              )}
            </div>
            <div>
              <input type="text" placeholder="شهر" {...register("city")} className={inputClass} />
              {errors.city && <p className="mt-1 text-xs text-red-600">{errors.city.message}</p>}
            </div>
            <div className="col-span-2">
              <input type="text" placeholder="آدرس" {...register("address")} className={inputClass} />
              {errors.address && (
                <p className="mt-1 text-xs text-red-600">{errors.address.message}</p>
              )}
            </div>
            <div>
              <input
                type="text"
                placeholder="کد پستی"
                {...register("postalCode")}
                className={inputClass}
              />
              {errors.postalCode && (
                <p className="mt-1 text-xs text-red-600">{errors.postalCode.message}</p>
              )}
            </div>
            <div>
              <input
                type="tel"
                placeholder="شماره موبایل"
                {...register("mobile")}
                className={inputClass}
              />
              {errors.mobile && (
                <p className="mt-1 text-xs text-red-600">{errors.mobile.message}</p>
              )}
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-bold">روش پرداخت</h2>
          <div className="mt-3 flex items-center gap-2 rounded border border-sky-600 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-700 dark:bg-sky-950 dark:text-sky-400">
            <span className="h-3 w-3 rounded-full bg-sky-600" />
            پرداخت آنلاین با درگاه زرین‌پال
          </div>
        </div>

        {serverError && <p className="text-sm text-red-600">{serverError}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="cursor-pointer rounded bg-sky-600 py-3.5 text-sm font-bold text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "در حال انتقال..." : "پرداخت و تکمیل خرید"}
        </button>
      </form>
      </div>
      </div>

      <div className="bg-[rgb(248_248_248)] px-6 py-12 lg:sticky lg:top-0 lg:h-screen lg:self-start lg:border-r lg:border-zinc-200 dark:bg-zinc-900 dark:lg:border-zinc-800">
      <div className="mx-auto max-w-xl">
        <ul className="flex flex-col gap-4">
          {items.map((item) => (
            <li key={item.id} className="flex gap-4">
              <div className="relative h-16 w-16 shrink-0 rounded bg-white">
                <Image src={item.imageUrl} alt={item.name} fill className="object-contain" />
                <span className="absolute -top-2 -right-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-zinc-900 px-1 text-[10px] font-bold text-white dark:bg-white dark:text-zinc-900">
                  {item.quantity}
                </span>
              </div>
              <div className="flex flex-1 items-center justify-between">
                <p className="text-sm font-semibold">{item.name}</p>
                <p className="text-sm">
                  {(item.price * item.quantity).toLocaleString("fa-IR")} تومان
                </p>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={discountCodeInput}
              onChange={(event) => setDiscountCodeInput(event.target.value)}
              placeholder="کد تخفیف"
              disabled={!!appliedDiscount}
              className="flex-1 rounded border border-zinc-300 px-4 py-2.5 text-sm outline-none focus:border-sky-600 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900"
            />
            {appliedDiscount ? (
              <button
                type="button"
                onClick={() => {
                  setAppliedDiscount(null);
                  setDiscountCodeInput("");
                }}
                className="cursor-pointer rounded border border-zinc-300 px-4 text-sm font-semibold dark:border-zinc-700"
              >
                حذف
              </button>
            ) : (
              <button
                type="button"
                onClick={handleApplyDiscount}
                disabled={isApplyingDiscount}
                className="cursor-pointer rounded border border-zinc-300 px-4 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700"
              >
                {isApplyingDiscount ? "در حال بررسی..." : "اعمال"}
              </button>
            )}
          </div>
          {discountError && <p className="mt-2 text-xs text-red-600">{discountError}</p>}
          {appliedDiscount && (
            <p className="mt-2 text-xs text-emerald-600">
              کد «{appliedDiscount.code}» اعمال شد.
            </p>
          )}
        </div>

        <div className="mt-6 flex flex-col gap-2 border-t border-zinc-200 pt-4 text-sm dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <span className="text-zinc-600 dark:text-zinc-400">جمع جزء</span>
            <span>{totalPrice.toLocaleString("fa-IR")} تومان</span>
          </div>
          {appliedDiscount && (
            <div className="flex items-center justify-between text-emerald-600">
              <span>تخفیف</span>
              <span>-{appliedDiscount.amount.toLocaleString("fa-IR")} تومان</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-zinc-600 dark:text-zinc-400">ارسال</span>
            <span className="text-zinc-500">در مرحله‌ی بعد محاسبه می‌شود</span>
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-zinc-200 pt-3 text-base font-bold dark:border-zinc-800">
            <span>جمع کل</span>
            <span>{finalTotal.toLocaleString("fa-IR")} تومان</span>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
