import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, Star } from "lucide-react";
import HeroScene from "@/components/home/HeroScene";
import { trustBadges } from "@/components/product/TrustBadges";

interface HeroShowcaseProps {
  /** Average of the approved store reviews (0 when there are none). */
  averageRating: number;
  reviewCount: number;
}

/**
 * The home page hero: a dark, full-width section with a photo behind, the
 * page's headline on the start (right) side and an animated 3D scene (a
 * supplement tub with capsules around it) in the dark empty part of the
 * photo on the end (left) side, clear of the man in it. It stays dark in
 * both themes.
 *
 * Besides the headline it carries what helps a visitor decide to buy: the
 * current offer, one clear call to action, the store's real review score
 * and the same trust claims as the product page.
 */
export default function HeroShowcase({ averageRating, reviewCount }: HeroShowcaseProps) {
  return (
    <section className="relative isolate overflow-hidden bg-black">
      <Image
        src="/images/hero-banner-2.webp"
        alt=""
        fill
        // It's the first thing on the page, so it's likely the LCP image.
        preload
        sizes="100vw"
        // His head is close to the photo's top edge, so on wide screens (where
        // `object-cover` must cut some height) all the cut comes from the
        // bottom. On phones the crop also shifts so he stands right of center,
        // leaving the top-left corner free for the 3D scene.
        className="-z-10 object-cover object-[20%_top] md:object-top"
      />
      {/* Darkest behind the text (the start side), fading toward the scene. */}
      <div className="absolute inset-0 -z-10 bg-linear-to-l from-black/90 via-black/50 to-black/20" />
      {/* Soften the bottom edge into the page. */}
      <div className="absolute inset-x-0 bottom-0 -z-10 h-1/3 bg-linear-to-t from-black/80 to-transparent" />

      {/* The 3D scene hugs the end (left, in RTL) edge of the screen: the
          top corner on phones, the vertical middle on wider screens. */}
      <div className="absolute inset-e-0 top-2 w-56 sm:w-72 md:top-1/2 md:w-[32%] md:max-w-md md:-translate-y-1/2">
        <HeroScene />
      </div>

      {/* On phones the text starts below the scene so the two don't overlap. */}
      <div className="mx-auto flex max-w-6xl items-center px-6 pt-56 pb-14 sm:pt-72 md:min-h-150 md:py-24">
        <div className="text-start">
          {/* The seasonal offer, as a small pill above the headline. */}
          <Link
            href="/products"
            className="group mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 py-1.5 ps-1.5 pe-3 text-sm text-zinc-200 backdrop-blur-sm transition hover:border-white/30 hover:bg-white/10"
          >
            <span className="rounded-full bg-sky-600 px-2.5 py-0.5 text-xs font-bold text-white">
              حراج فصل
            </span>
            تخفیف ویژه روی مکمل‌ها
            <ChevronLeft
              aria-hidden="true"
              className="h-4 w-4 transition-transform group-hover:-translate-x-0.5"
            />
          </Link>

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
            {/* The one primary action, in the brand's solid blue. */}
            <Link
              href="/products"
              className="rounded-xl bg-sky-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-sky-600/25 transition hover:bg-sky-500"
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

          {/* Real social proof from the store's approved reviews. */}
          {reviewCount > 0 && (
            <Link
              href="/reviews"
              className="mt-6 inline-flex items-center gap-2 text-sm text-zinc-300 transition hover:text-white"
            >
              <span className="flex" aria-hidden="true">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.round(averageRating)
                        ? "fill-amber-400 text-amber-400"
                        : "fill-zinc-600 text-zinc-600"
                    }`}
                  />
                ))}
              </span>
              <span>
                <strong className="font-bold text-white">
                  {averageRating.toLocaleString("fa-IR")} از ۵
                </strong>{" "}
                — بر اساس {reviewCount.toLocaleString("fa-IR")} نظر مشتری
              </span>
            </Link>
          )}

          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3 border-t border-white/10 pt-6">
            {trustBadges.map(({ icon: Icon, title, href }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="flex items-center gap-2 text-sm text-zinc-300 transition hover:text-white"
                >
                  <Icon aria-hidden="true" className="h-5 w-5 shrink-0 text-sky-400" />
                  {title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
