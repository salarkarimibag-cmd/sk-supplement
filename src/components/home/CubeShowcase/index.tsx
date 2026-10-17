import Image from "next/image";
import Link from "next/link";
import RubikCube from "@/components/home/RubikCube";

/**
 * The home page hero: a dark, full-width section with a photo behind, the
 * page's headline on the start (right) side and an animated 3D cube in the
 * dark empty part of the photo on the end (left) side, clear of the man in
 * it. It stays dark in both themes.
 */
export default function CubeShowcase() {
  return (
    <section className="relative isolate overflow-hidden bg-black">
      <Image
        src="/images/hero-banner-2.webp"
        alt=""
        fill
        // It's the first thing on the page, so it's likely the LCP image.
        preload
        sizes="100vw"
        // Keep his head in frame. On phones the crop also shifts so he stands
        // right of center, leaving the top-left corner free for the cube.
        className="-z-10 object-cover object-[20%_25%] md:object-[center_25%]"
      />
      {/* Darkest behind the text (the start side), fading toward the cube. */}
      <div className="absolute inset-0 -z-10 bg-linear-to-l from-black/90 via-black/50 to-black/20" />
      {/* Soften the bottom edge into the page. */}
      <div className="absolute inset-x-0 bottom-0 -z-10 h-1/3 bg-linear-to-t from-black/80 to-transparent" />

      {/* The cube hugs the end (left, in RTL) edge of the screen: the top
          corner on phones, the vertical middle on wider screens. */}
      <div className="absolute inset-e-0 top-2 w-44 sm:w-56 md:top-1/2 md:w-[32%] md:max-w-md md:-translate-y-1/2">
        <RubikCube />
      </div>

      {/* On phones the text starts below the cube so the two don't overlap. */}
      <div className="mx-auto flex max-w-6xl items-center px-6 pt-48 pb-14 sm:pt-60 md:min-h-150 md:py-24">
        <div className="text-start">
          {/* The hero holds the page's only h1, as the old banner did. */}
          <h1 className="bg-linear-to-b from-white to-zinc-400 bg-clip-text text-5xl leading-tight font-extrabold tracking-tight text-transparent sm:text-6xl lg:text-7xl">
            قدرت واقعی
            <br />
            رو بساز
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-zinc-300 sm:text-lg">
            مکمل‌های اصل و باکیفیت برای هر مرحله از مسیر تمرینیت؛ از اولین روز باشگاه تا روی سکو.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/products"
              className="rounded-xl border border-white/15 bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/20"
            >
              شروع خرید
            </Link>
            <Link
              href="/blogs"
              className="px-2 py-3 text-sm font-semibold text-zinc-300 transition hover:text-white"
            >
              مقالات آموزشی
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
