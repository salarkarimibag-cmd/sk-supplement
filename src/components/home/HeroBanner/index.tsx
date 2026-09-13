import Image from "next/image";
import Link from "next/link";
import GradientOverlay from "@/components/ui/GradientOverlay";

export default function HeroBanner() {
  return (
    <section className="relative flex h-[420px] overflow-hidden bg-black sm:h-[480px] md:h-[560px]">
      <div className="relative h-full w-1/2">
        <Image
          src="/images/hero-banner-1.jpg"
          alt=""
          fill
          priority
          sizes="50vw"
          className="object-cover"
        />
      </div>

      <div className="relative h-full w-1/2">
        <Image
          src="/images/hero-banner-2.jpg"
          alt=""
          fill
          priority
          sizes="50vw"
          className="object-cover"
        />
      </div>

      {/* soft blend over the seam between the two images */}
      <div className="absolute inset-y-0 left-1/2 w-24 -translate-x-1/2 bg-gradient-to-r from-black/0 via-black/50 to-black/0" />

      <GradientOverlay from="from-black/70" via="via-black/30" />

      <div className="absolute inset-x-0 bottom-0">
        <div className="mx-auto max-w-6xl px-6 py-10 text-right">
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            حراج ویژه فصل
          </h1>
          <p className="mt-2 max-w-md text-sm text-zinc-200 sm:text-base">
            بهترین مکمل‌های ورزشی با تخفیف ویژه، فقط برای مدت محدود.
          </p>
          <Link
            href="/collections/sale"
            className="mt-5 inline-block rounded bg-sky-600 px-6 py-3 text-sm font-bold text-white transition hover:scale-105 hover:bg-sky-600"
          >
            مشاهده حراج
          </Link>
        </div>
      </div>
    </section>
  );
}
