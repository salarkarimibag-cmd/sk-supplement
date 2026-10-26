import Image from "next/image";
import Link from "next/link";

export default function PromoBanner() {
  return (
    <section className="relative h-105 overflow-hidden bg-black sm:h-115">
      {/* left-0 / right-0 stay physical on purpose: they pair with the
          bg-linear-to-r fade, whose direction is always physical. */}
      <div className="absolute inset-y-0 left-0 w-full sm:w-1/2">
        <Image
          src="/images/promo-banner.webp"
          alt=""
          fill
          sizes="(min-width: 640px) 50vw, 100vw"
          className="object-cover"
        />
        <div className="absolute inset-y-0 right-0 w-24 bg-linear-to-r from-transparent to-black" />
      </div>

      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent sm:hidden" />

      <div className="relative mx-auto flex h-full max-w-6xl items-center px-6">
        <div className="max-w-lg text-start">
          <h2 className="text-3xl leading-tight font-extrabold text-balance text-white sm:text-4xl">
            تغذیه ورزشی حرفه‌ای و مکمل‌های باکیفیت
          </h2>
          <p className="mt-4 text-base text-zinc-300 sm:text-lg">
            پک‌های ترکیبی با صرفه‌جویی بالا را از دست ندهید!
          </p>
          <Link
            href="/products"
            className="mt-6 inline-block rounded bg-sky-600 px-10 py-4 text-base font-bold text-white transition hover:scale-105 hover:bg-sky-500"
          >
            مشاهده پک‌های ترکیبی
          </Link>
        </div>
      </div>
    </section>
  );
}
