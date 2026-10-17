import Image from "next/image";
import Link from "next/link";
import RubikCube from "@/components/home/RubikCube";

/**
 * A dark, full-width section: a photo behind, a headline on one side and an
 * animated 3D cube on the other. It's dark in both themes, like the hero.
 */
export default function CubeShowcase() {
  return (
    <section className="relative isolate overflow-hidden bg-black">
      <Image
        src="/images/cube-section-bg.jpg"
        alt=""
        fill
        sizes="100vw"
        // Keep the subject's head in frame on wide screens.
        className="-z-10 object-cover object-[center_25%]"
      />
      {/* Darkest behind the text (the start side), fading toward the cube. */}
      <div className="absolute inset-0 -z-10 bg-linear-to-l from-black/90 via-black/50 to-black/20" />
      {/* Soften the bottom edge into the page. */}
      <div className="absolute inset-x-0 bottom-0 -z-10 h-1/3 bg-linear-to-t from-black/80 to-transparent" />

      <div className="mx-auto grid max-w-6xl items-center gap-4 px-6 py-14 md:grid-cols-2 md:gap-10 md:py-24">
        <div className="text-start">
          <h2 className="bg-linear-to-b from-white to-zinc-400 bg-clip-text text-5xl leading-tight font-extrabold tracking-tight text-transparent sm:text-6xl lg:text-7xl">
            قدرت واقعی
            <br />
            رو بساز
          </h2>
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

        {/* On phones the cube sits above the text, like the reference design. */}
        <div className="order-first mx-auto w-full max-w-xs sm:max-w-sm md:order-none md:max-w-none">
          <RubikCube />
        </div>
      </div>
    </section>
  );
}
