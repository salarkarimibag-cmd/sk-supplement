import HeroProducts from "@/components/home/HeroProducts";
import type { ShowcaseProduct } from "@/lib/showcase";

// The title and description fade up into place one after the other, like
// the home hero's text (fade-in-up keyframes in globals.css). "backwards"
// keeps each one hidden during its delay; reduced motion turns it off.
const ENTER = "animate-[fade-in-up_0.6s_ease-out_backwards] motion-reduce:animate-none";
const ENTER_STEP_MS = 90;

function enterDelay(step: number) {
  return { animationDelay: `${step * ENTER_STEP_MS}ms` };
}

interface CollectionHeroProps {
  title: string;
  description: string;
  /** This category's products whose photos take turns beside the title. */
  products: ShowcaseProduct[];
}

/**
 * The top of a category page, in the style of the home hero: a dark section
 * (in both themes) with the category's title and description on the start
 * (right) side and its own product photos taking turns, with the home hero's
 * animation, on the end (left) side. On phones the photos sit above the text.
 */
export default function CollectionHero({ title, description, products }: CollectionHeroProps) {
  return (
    <section className="relative isolate overflow-hidden bg-black">
      {/* A soft brand-blue light behind the products, fading toward the text. */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_25%_50%,rgb(14_165_233/0.16),transparent_65%)]" />

      <div className="mx-auto flex max-w-6xl flex-col-reverse items-center gap-4 px-6 pt-6 pb-10 md:min-h-96 md:flex-row md:justify-between md:gap-10 md:py-10">
        <div className="w-full text-start md:max-w-xl">
          {/* The page's only h1. */}
          <h1
            style={enterDelay(0)}
            className={`bg-linear-to-b from-white to-zinc-400 bg-clip-text text-4xl leading-tight font-extrabold tracking-tight text-transparent sm:text-5xl ${ENTER}`}
          >
            {title}
          </h1>
          <p
            style={enterDelay(1)}
            className={`mt-4 max-w-xl text-base leading-relaxed text-zinc-300 sm:text-lg ${ENTER}`}
          >
            {description}
          </p>
        </div>

        {products.length > 0 && (
          <div className="w-56 shrink-0 sm:w-64 md:w-[32%] md:max-w-sm">
            <HeroProducts products={products} />
          </div>
        )}
      </div>
    </section>
  );
}
