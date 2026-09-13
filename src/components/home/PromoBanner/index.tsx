import Image from "next/image";
import Link from "next/link";

export default function PromoBanner() {
  return (
    <section className="relative h-[420px] overflow-hidden bg-black sm:h-[460px]">
      <div className="absolute inset-y-0 left-0 w-full sm:w-1/2">
        <Image
          src="/images/cbm.jpg"
          alt=""
          fill
          sizes="(min-width: 640px) 50vw, 100vw"
          className="object-cover"
        />
        <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-r from-transparent to-black" />
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent sm:hidden" />

      <div className="relative mx-auto flex h-full max-w-6xl items-center px-6">
        <div className="max-w-lg text-right">
          <h2 className="text-3xl leading-tight font-extrabold text-white sm:text-4xl">
            تغذیه ورزشی حرفه‌ای و مکمل‌های باکیفیت
          </h2>
          <p className="mt-4 text-sm text-zinc-300 sm:text-base">
            پک‌های ترکیبی با صرفه‌جویی بالا را از دست ندهید!
          </p>
          <Link
            href="/collections/shop"
            className="mt-6 inline-block rounded bg-sky-600 px-8 py-3 text-sm font-bold text-white transition hover:scale-105 hover:bg-sky-500"
          >
            خرید کنید
          </Link>
        </div>
      </div>
    </section>
  );
}
