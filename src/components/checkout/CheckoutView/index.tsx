"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CreditCard, Landmark, ShoppingBag } from "lucide-react";
import BankCard from "@/components/checkout/BankCard";
import Collapsible from "@/components/ui/Collapsible";
import { useCart } from "@/context/CartContext";
import { cardTransferSchema, type ShopCard } from "@/lib/cardPayment";
import {
  ADDRESS_MAX_LENGTH,
  NAME_MAX_LENGTH,
  PLACE_MAX_LENGTH,
  contactSchema,
  shippingAddressSchema,
} from "@/lib/checkoutFields";
import { EMAIL_MAX_LENGTH } from "@/lib/publicForms";
import type { CartCatalogEntry } from "@/lib/cartSync";
import { SALES_CLOSED_MESSAGE, SALES_OPEN } from "@/lib/sales";

const checkoutSchema = z
  .object({
    // The contact and address rules are the ones the order API checks, so
    // what passes here passes there (Persian digits in the mobile number and
    // postal code are converted on the way).
    ...contactSchema.shape,
    ...shippingAddressSchema.shape,
    paymentMethod: z.enum(["zarinpal", "card"]),
    trackingCode: z.string(),
    cardLast4: z.string(),
  })
  // The transfer fields only matter for card-to-card. They're checked with
  // the same schema the server uses, so the two can't drift apart; only the
  // Persian error messages are added here.
  .superRefine((values, ctx) => {
    if (values.paymentMethod !== "card") return;
    const result = cardTransferSchema.safeParse({
      trackingCode: values.trackingCode,
      cardLast4: values.cardLast4,
    });
    for (const issue of result.error?.issues ?? []) {
      const field = issue.path[0];
      ctx.addIssue({
        code: "custom",
        path: [field],
        message: field === "cardLast4" ? "۴ رقم آخر کارت را وارد کنید." : "کد پیگیری نامعتبر است.",
      });
    }
  });

type CheckoutValues = z.infer<typeof checkoutSchema>;
type TextFieldName = Exclude<keyof CheckoutValues, "paymentMethod">;

const inputClass =
  "w-full rounded border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-sky-600 aria-[invalid=true]:border-red-600 dark:border-zinc-700 dark:bg-zinc-900";

/**
 * A visible label above its input, and the error under it. A placeholder
 * alone isn't a label: it disappears as soon as the buyer starts typing,
 * and not every screen reader announces it.
 */
function Field({
  id,
  label,
  error,
  className,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm text-zinc-700 dark:text-zinc-300">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

function paymentOptionClass(selected: boolean) {
  return `flex cursor-pointer items-center gap-2 rounded border px-4 py-3 text-sm font-semibold ${
    selected
      ? "border-sky-600 bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-400"
      : "border-zinc-300 dark:border-zinc-700"
  }`;
}

// ms-auto pushes the icon to the far end of the row (the end side in RTL).
// A selected row already has sky-coloured text, so the icon only needs a
// colour of its own when the option is not selected.
function paymentIconClass(selected: boolean) {
  return `ms-auto h-5 w-5 ${selected ? "" : "text-zinc-400"}`;
}

function CheckoutLogo() {
  return (
    <div className="pb-6">
      <Link href="/" className="inline-flex items-center">
        {/* The light logo has an opaque white background, so dark mode swaps in the dark-card logo used in the header. */}
        <Image
          src="/images/logo-checkout.webp"
          alt="SK Supplement"
          width={746}
          height={424}
          className="h-24 w-auto dark:hidden"
        />
        <Image
          src="/images/logo.webp"
          alt=""
          aria-hidden="true"
          width={680}
          height={380}
          className="hidden h-24 w-auto dark:block"
        />
      </Link>
    </div>
  );
}

interface AppliedDiscount {
  code: string;
  amount: number;
}

export default function CheckoutView({ shopCard }: { shopCard: ShopCard | null }) {
  const router = useRouter();
  const { items, totalPrice, totalCount, clearCart, syncWithCatalog } = useCart();
  // The cart's prices and stock were saved in the browser when each product
  // was added, so they may be out of date. Until the current ones are loaded,
  // nothing that depends on the total (paying, the card amount, a discount)
  // is allowed.
  const [priceStatus, setPriceStatus] = useState<"loading" | "ready" | "error">("loading");
  const [pricesChanged, setPricesChanged] = useState(false);
  const [quantitiesChanged, setQuantitiesChanged] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [discountCodeInput, setDiscountCodeInput] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<AppliedDiscount | null>(null);
  const [discountError, setDiscountError] = useState<string | null>(null);
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { paymentMethod: "zarinpal", trackingCode: "", cardLast4: "" },
  });
  // useWatch (not watch()) so React's compiler can track the value safely.
  const paymentMethod = useWatch({ control, name: "paymentMethod" });

  // What every text input needs: its id (for the label), the form binding,
  // and, while it has an error, aria-invalid plus a link to the error text
  // so screen readers announce it with the field.
  function fieldProps(name: TextFieldName) {
    const hasError = Boolean(errors[name]);
    return {
      id: name,
      ...register(name),
      "aria-invalid": hasError || undefined,
      "aria-describedby": hasError ? `${name}-error` : undefined,
      className: inputClass,
    };
  }

  const finalTotal = totalPrice - (appliedDiscount?.amount ?? 0);
  const pricesReady = priceStatus === "ready";

  // A string, not the items array, so the effect runs again only when the
  // products in the cart change, not on every quantity or price update.
  const productIdsKey = items.map((item) => item.id).join(",");

  useEffect(() => {
    if (!SALES_OPEN || !productIdsKey) return;
    // Set by the cleanup, so a response that arrives after the cart changed
    // again (or the page was left) is ignored.
    let ignore = false;

    fetch("/api/cart/prices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productIds: productIdsKey.split(",") }),
    })
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data: { products: CartCatalogEntry[] }) => {
        if (ignore) return;
        const changes = syncWithCatalog(data.products);
        if (changes.pricesChanged) setPricesChanged(true);
        if (changes.quantitiesChanged) setQuantitiesChanged(true);
        setPriceStatus("ready");
      })
      .catch(() => {
        if (!ignore) setPriceStatus("error");
      });

    return () => {
      ignore = true;
    };
  }, [productIdsKey, syncWithCatalog]);

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

    // Prices and totals are left out on purpose: the server looks them up
    // itself, so only product ids, quantities and the code are sent.
    const order = {
      discountCode: appliedDiscount?.code,
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
      })),
    };

    if (values.paymentMethod === "card") {
      await submitCardOrder({
        ...order,
        cardTransfer: { trackingCode: values.trackingCode, cardLast4: values.cardLast4 },
      });
      return;
    }

    try {
      const response = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order),
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

  async function submitCardOrder(body: object) {
    try {
      const response = await fetch("/api/payment/card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await response.json();

      if (!response.ok) {
        setServerError(data.message ?? "ثبت سفارش ناموفق بود.");
        return;
      }

      clearCart();
      router.push("/checkout/card-submitted");
    } catch {
      setServerError("خطایی در ثبت سفارش رخ داد.");
    }
  }

  function getSubmitLabel() {
    if (priceStatus === "loading") return "در حال به‌روزرسانی قیمت‌ها...";
    if (paymentMethod === "card") return isSubmitting ? "در حال ثبت..." : "ثبت سفارش";
    return isSubmitting ? "در حال انتقال..." : "پرداخت و تکمیل خرید";
  }
  const submitLabel = getSubmitLabel();

  // While sales are closed (src/lib/sales.ts) the form isn't shown at all.
  const notice = !SALES_OPEN
    ? SALES_CLOSED_MESSAGE
    : items.length === 0
      ? "سبد خرید شما خالی است."
      : null;

  if (notice) {
    return (
      <div className="mx-auto w-full max-w-3xl px-6 py-16 text-center">
        <CheckoutLogo />
        <h1 className="mt-10 text-2xl font-bold">تسویه حساب</h1>
        <p className="mt-3 text-zinc-600 dark:text-zinc-400">{notice}</p>
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
        className="absolute top-6 end-6 flex h-11 w-11 items-center justify-center rounded-full bg-sky-600 text-white shadow-sm transition hover:bg-sky-500"
      >
        <ShoppingBag className="h-5 w-5" />
        {totalCount > 0 && (
          <span className="absolute -top-1 -start-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-[10px] font-bold text-zinc-900">
            {totalCount.toLocaleString("fa-IR")}
          </span>
        )}
      </Link>
      <div className="mx-auto max-w-xl">
      <CheckoutLogo />
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-10 flex flex-col gap-8">
        <div>
          <h2 className="text-lg font-bold">اطلاعات تماس</h2>
          {/* autoComplete tells the browser what each field is, so it can
              fill in the buyer's saved details (and phones suggest them). */}
          <Field id="email" label="ایمیل" error={errors.email?.message} className="mt-3">
            <input
              type="email"
              autoComplete="email"
              maxLength={EMAIL_MAX_LENGTH}
              {...fieldProps("email")}
            />
          </Field>
        </div>

        <div>
          <h2 className="text-lg font-bold">اطلاعات ارسال</h2>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <Field id="firstName" label="نام" error={errors.firstName?.message}>
              <input
                type="text"
                autoComplete="given-name"
                maxLength={NAME_MAX_LENGTH}
                {...fieldProps("firstName")}
              />
            </Field>
            <Field id="lastName" label="نام خانوادگی" error={errors.lastName?.message}>
              <input
                type="text"
                autoComplete="family-name"
                maxLength={NAME_MAX_LENGTH}
                {...fieldProps("lastName")}
              />
            </Field>
            <Field id="province" label="استان" error={errors.province?.message}>
              <input
                type="text"
                autoComplete="address-level1"
                maxLength={PLACE_MAX_LENGTH}
                {...fieldProps("province")}
              />
            </Field>
            <Field id="city" label="شهر" error={errors.city?.message}>
              <input
                type="text"
                autoComplete="address-level2"
                maxLength={PLACE_MAX_LENGTH}
                {...fieldProps("city")}
              />
            </Field>
            <Field
              id="address"
              label="آدرس"
              error={errors.address?.message}
              className="col-span-2"
            >
              <input
                type="text"
                autoComplete="street-address"
                maxLength={ADDRESS_MAX_LENGTH}
                {...fieldProps("address")}
              />
            </Field>
            <Field id="postalCode" label="کد پستی" error={errors.postalCode?.message}>
              {/* Text with a numeric keyboard, not type="number", which would
                  drop a leading zero and add a spinner. */}
              <input
                type="text"
                inputMode="numeric"
                autoComplete="postal-code"
                placeholder="۱۰ رقم"
                {...fieldProps("postalCode")}
              />
            </Field>
            <Field id="mobile" label="شماره موبایل" error={errors.mobile?.message}>
              <input
                type="tel"
                autoComplete="tel"
                placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                {...fieldProps("mobile")}
              />
            </Field>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-bold">روش پرداخت</h2>
          <div className="mt-3 flex flex-col gap-2">
            <label className={paymentOptionClass(paymentMethod === "zarinpal")}>
              <input type="radio" value="zarinpal" {...register("paymentMethod")} className="accent-sky-600" />
              پرداخت آنلاین با درگاه زرین‌پال
              <Landmark aria-hidden="true" className={paymentIconClass(paymentMethod === "zarinpal")} />
            </label>
            {shopCard && (
              <label className={paymentOptionClass(paymentMethod === "card")}>
                <input
                  type="radio"
                  value="card"
                  {...register("paymentMethod")}
                  aria-controls="card-transfer-panel"
                  className="accent-sky-600"
                />
                کارت به کارت
                <CreditCard aria-hidden="true" className={paymentIconClass(paymentMethod === "card")} />
              </label>
            )}
          </div>

          {shopCard && (
            // Always mounted and animated open/closed (instead of being added
            // and removed) so the panel eases in and the page below doesn't jump.
            // The gap above it is padding, because margin wouldn't animate.
            <Collapsible open={paymentMethod === "card"} id="card-transfer-panel">
              <div className="pt-4">
                <div className="rounded border border-zinc-200 p-4 text-sm dark:border-zinc-800">
                  <p>
                    مبلغ{" "}
                    <strong>
                      {pricesReady ? `${finalTotal.toLocaleString("fa-IR")} تومان` : "…"}
                    </strong>{" "}
                    را به کارت زیر واریز کنید، سپس کد پیگیری واریز را وارد کنید.
                  </p>
                  {/* The card follows the panel with a short delay, rising and
                      scaling into place, so it looks like it slides out of it. */}
                  <div
                    className={`mt-4 transition duration-500 ease-out ${
                      paymentMethod === "card"
                        ? "translate-y-0 scale-100 opacity-100 delay-150"
                        : "-translate-y-3 scale-95 opacity-0"
                    }`}
                  >
                    <BankCard card={shopCard} />
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    {/* autoComplete="off": these belong to this one transfer,
                        so the browser shouldn't suggest old values. */}
                    <Field
                      id="trackingCode"
                      label="کد پیگیری واریز"
                      error={errors.trackingCode?.message}
                    >
                      <input
                        type="text"
                        inputMode="numeric"
                        autoComplete="off"
                        {...fieldProps("trackingCode")}
                      />
                    </Field>
                    <Field
                      id="cardLast4"
                      label="۴ رقم آخر کارت شما"
                      error={errors.cardLast4?.message}
                    >
                      <input
                        type="text"
                        inputMode="numeric"
                        autoComplete="off"
                        maxLength={4}
                        {...fieldProps("cardLast4")}
                      />
                    </Field>
                  </div>
                  <p className="mt-3 text-xs text-zinc-500">
                    سفارش پس از تأیید واریز توسط فروشگاه پردازش و ارسال می‌شود.
                  </p>
                </div>
              </div>
            </Collapsible>
          )}
        </div>

        {pricesChanged && (
          <p className="text-sm text-amber-600 dark:text-amber-500">
            قیمت برخی کالاها از زمان افزودن به سبد تغییر کرده و مبالغ به‌روز شده‌اند. لطفاً پیش از
            پرداخت، جمع کل را دوباره بررسی کنید.
          </p>
        )}
        {quantitiesChanged && (
          <p className="text-sm text-amber-600 dark:text-amber-500">
            موجودی برخی کالاها کمتر از تعداد سبد شما بود؛ تعداد آن‌ها کم شد یا کالای ناموجود از سبد
            حذف شد. لطفاً سبد را پیش از پرداخت بررسی کنید.
          </p>
        )}
        {priceStatus === "error" && (
          <p className="text-sm text-red-600">
            دریافت قیمت‌های به‌روز ناموفق بود. لطفاً صفحه را دوباره بارگذاری کنید.
          </p>
        )}
        {serverError && <p className="text-sm text-red-600">{serverError}</p>}

        <button
          type="submit"
          disabled={isSubmitting || !pricesReady}
          className="cursor-pointer rounded bg-sky-600 py-3.5 text-sm font-bold text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitLabel}
        </button>
      </form>
      </div>
      </div>

      <div className="bg-[rgb(248_248_248)] px-6 py-12 lg:sticky lg:top-0 lg:h-screen lg:self-start lg:border-r lg:border-zinc-200 dark:bg-zinc-900 dark:lg:border-zinc-800">
      <div className="mx-auto max-w-xl">
        <ul className="flex flex-col gap-4">
          {items.map((item) => (
            <li key={item.id} className="flex gap-4">
              <div className="relative h-16 w-16 shrink-0 rounded bg-white dark:bg-zinc-800">
                <Image src={item.imageUrl} alt={item.name} fill sizes="64px" className="object-contain" />
                <span className="absolute -top-2 -start-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-zinc-900 px-1 text-[10px] font-bold text-white dark:bg-white dark:text-zinc-900">
                  {item.quantity.toLocaleString("fa-IR")}
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
              // The placeholder is the only visible text, so it's also the label.
              aria-label="کد تخفیف"
              autoComplete="off"
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
                // The amount off depends on the subtotal, so it waits for current prices.
                disabled={isApplyingDiscount || !pricesReady}
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
            {/* Same green as the discount line: both are savings for the buyer. */}
            <span className="text-emerald-600">رایگان</span>
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
