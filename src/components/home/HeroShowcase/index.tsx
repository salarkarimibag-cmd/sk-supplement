import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, Star } from "lucide-react";
import HeroScene from "@/components/home/HeroScene";
import { trustBadges } from "@/components/product/TrustBadges";
import type { ListedProduct } from "@/lib/products";
import type { HeroPromotion } from "@/lib/promotion";

// The text blocks fade up into place one after another when the page loads,
// using the fade-in-up keyframes in globals.css (as Testimonials does).
// "backwards" keeps each block hidden during its delay. Users who ask for
// reduced motion get no animation at all: the global rule in globals.css only
// shortens durations, not delays, so the later blocks would otherwise still
// stay hidden for a moment and then pop in.
const ENTER = "animate-[fade-in-up_0.6s_ease-out_backwards] motion-reduce:animate-none";
const ENTER_STEP_MS = 90;

function enterDelay(step: number) {
  return { animationDelay: `${step * ENTER_STEP_MS}ms` };
}

// The text blocks fade up into place one after another when the page loads,
// using the fade-in-up keyframes in globals.css (as Testimonials does).
// "backwards" keeps each block hidden during its delay. Users who ask for
// reduced motion get no animation at all: the global rule in globals.css only
// shortens durations, not delays, so the later blocks would otherwise still
// stay hidden for a moment and then pop in.
const ENTER = "animate-[fade-in-up_0.6s_ease-out_backwards] motion-reduce:animate-none";
const ENTER_STEP_MS = 90;

function enterDelay(step: number) {
  return { animationDelay: `${step * ENTER_STEP_MS}ms` };
}

interface HeroShowcaseProps {
  /** Average of the approved store reviews (0 when there are none). */
  averageRating: number;
  reviewCount: number;
  /** The best-selling product to feature under the 3D tub, if any. */
  bestSeller?: Pick<ListedProduct, "id" | "name" | "price" | "imageUrl">;
  /** The advertised discount code, or null to show the generic offer text. */
  promotion: HeroPromotion | null;
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
 * and the same trust claims as the product page. A small card under the 3D
 * tub links it to a real product: the current best seller.
 */
export default function HeroShowcase({
  averageRating,
  reviewCount,
  bestSeller,
  promotion,
}: HeroShowcaseProps) {
  return (
    <section className="relative isolate overflow-hidden bg-black">
      {/* The photo. From md up it fills the whole section, behind the text.
          On phones the section is tall and narrow, so a full-height cover
          would zoom the (landscape) photo far in and hide the man; there it
          fills only the top part and fades into black where the text starts. */}
      <div className="absolute inset-x-0 top-0 -z-10 h-110 sm:h-130 md:inset-y-0 md:h-auto">
        <Image
          src="/images/hero-banner-2.webp"
          alt=""
          fill
          // It's the first thing on the page, so it's likely the LCP image.
          preload
          sizes="100vw"
          // His head is close to the photo's top edge, so the crop always
          // keeps the top. On phones it also shifts so he stands right of
          // center, leaving the top-left corner for the 3D scene.
          className="object-cover object-[34%_top] sm:object-[42%_top] md:object-top"
        />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-black via-black/60 to-transparent md:hidden" />
      </div>
      {/* From md up: darkest behind the text (the start side), fading toward
          the scene, and a soft bottom edge. On phones the text sits below the
          photo instead, so the man isn't darkened. */}
      <div className="absolute inset-0 -z-10 hidden bg-linear-to-l from-black/90 via-black/50 to-black/20 md:block" />
      <div className="absolute inset-x-0 bottom-0 -z-10 hidden h-1/3 bg-linear-to-t from-black/80 to-transparent md:block" />

      {/* The 3D scene hugs the end (left, in RTL) edge of the screen: the
          top corner on phones, the vertical middle on wider screens. */}
      <div className="absolute inset-e-0 top-2 w-56 sm:w-72 md:top-1/2 md:w-[32%] md:max-w-md md:-translate-y-1/2">
        <HeroScene />

        {bestSeller && (
          <Link
            href={`/products/${bestSeller.id}`}
            className="group mx-auto -mt-2 flex w-[90%] max-w-xs items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-2 pe-3 backdrop-blur-md transition hover:border-white/25 hover:bg-white/10"
          >
            <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-white">
              {/* The name is right beside it, so the image is decorative. */}
              <Image
                src={bestSeller.imageUrl}
                alt=""
                fill
                sizes="48px"
                className="object-contain p-1"
              />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-bold text-sky-400">پرفروش‌ترین</span>
              <span className="block truncate text-sm font-bold text-white">{bestSeller.name}</span>
              <span className="block text-xs text-zinc-300">
                {bestSeller.price.toLocaleString("fa-IR")} تومان
              </span>
            </span>
            <ChevronLeft
              aria-hidden="true"
              className="h-4 w-4 shrink-0 text-zinc-400 transition-transform group-hover:-translate-x-0.5"
            />
          </Link>
        )}
      </div>

      {/* On phones the text starts low on the photo, where it has faded to
          black, so it neither covers the man nor the 3D scene. */}
      <div className="mx-auto flex max-w-6xl items-center px-6 pt-80 pb-14 sm:pt-96 md:min-h-150 md:py-24">
        <div className="text-start">
          {/* The seasonal offer, as a small pill above the headline. */}
          <Link
            href="/products"
            style={enterDelay(0)}
            className={`group mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 py-1.5 ps-1.5 pe-3 text-sm text-zinc-200 backdrop-blur-sm transition hover:border-white/30 hover:bg-white/10 ${ENTER}`}
          >
            <span className="rounded-full bg-sky-600 px-2.5 py-0.5 text-xs font-bold text-white">
              حراج فصل
            </span>
            {promotion ? (
              <span>
                {promotion.amount} تخفیف با کد{" "}
                {/* Latin text inside Persian: keep it left-to-right. */}
                <bdi dir="ltr" className="font-mono font-bold text-white">
                  {promotion.code}
                </bdi>
              </span>
            ) : (
              "تخفیف ویژه روی مکمل‌ها"
            )}
            <ChevronLeft
              aria-hidden="true"
              className="h-4 w-4 transition-transform group-hover:-translate-x-0.5"
            />
          </Link>

          {/* The hero holds the page's only h1, as the old banner did. */}
          <h1
            style={enterDelay(1)}
            className={`bg-linear-to-b from-white to-zinc-400 bg-clip-text text-5xl leading-tight font-extrabold tracking-tight text-transparent sm:text-6xl lg:text-7xl ${ENTER}`}
          >
            قدرت واقعی
            <br />
            رو بساز
          </h1>
          <p
            style={enterDelay(2)}
            className={`mt-5 max-w-md text-base leading-relaxed text-zinc-300 sm:text-lg ${ENTER}`}
          >
            مکمل‌های اصل و باکیفیت برای هر مرحله از مسیر تمرینیت؛ از اولین روز باشگاه تا روی سکو.
          </p>
          <div style={enterDelay(3)} className={`mt-8 flex flex-wrap items-center gap-4 ${ENTER}`}>
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
              style={enterDelay(4)}
              className={`mt-6 inline-flex items-center gap-2 text-sm text-zinc-300 transition hover:text-white ${ENTER}`}
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

          <ul
            style={enterDelay(5)}
            className={`mt-8 flex flex-wrap gap-x-6 gap-y-3 border-t border-white/10 pt-6 ${ENTER}`}
          >
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
