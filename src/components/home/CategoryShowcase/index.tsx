import Image from "next/image";
import Link from "next/link";
import { Droplets, Dumbbell, Flame, ShoppingBag, Zap, type LucideIcon } from "lucide-react";
import GradientOverlay from "@/components/ui/GradientOverlay";
import type { CatalogProduct } from "@/data/catalog";
import { pickShowcaseProducts, type ShowcaseProduct } from "@/lib/showcase";

interface Tile {
  /** Category slug, or null for the "all products" tile. */
  slug: string | null;
  name: string;
  /** Background behind the product photos. */
  gradient: string;
  /** Shown instead of photos while the category has none yet. */
  icon: LucideIcon;
  className?: string;
}

const tiles: Tile[] = [
  {
    slug: null,
    name: "مشاهده همه",
    gradient: "from-sky-400 to-blue-700",
    icon: ShoppingBag,
    className: "col-span-2 md:col-span-1 md:row-span-2",
  },
  { slug: "fat-burner", name: "چربی‌سوزها", gradient: "from-amber-400 to-rose-600", icon: Flame },
  { slug: "aminos", name: "آمینو اسیدها", gradient: "from-lime-400 to-emerald-700", icon: Droplets },
  { slug: "protein", name: "پروتئین", gradient: "from-pink-300 to-rose-600", icon: Dumbbell },
  { slug: "pre-workout", name: "پیش‌تمرین‌ها", gradient: "from-yellow-400 to-orange-600", icon: Zap },
];

const PRODUCTS_PER_TILE = 3;

/**
 * Up to three product packs fanned out, best seller in the middle and in
 * front. The cards are zinc-100, the same light gray as the backdrop of the
 * few photos that aren't transparent cutouts, so those blend in too.
 */
function ProductFan({ products }: { products: ShowcaseProduct[] }) {
  // [2nd, 1st, 3rd]: the best seller lands in the middle.
  const ordered = [products[1], products[0], products[2]].filter(Boolean);
  const fanClasses =
    ordered.length === 1
      ? ["z-10"]
      : ordered.length === 2
        ? ["-rotate-6", "z-10 rotate-6"]
        : ["-rotate-8", "z-10 scale-115", "rotate-8"];

  return (
    <div className="absolute inset-0 flex items-center justify-center pb-10 transition-transform duration-700 ease-out group-hover:scale-110">
      {ordered.map((product, index) => (
        <div
          key={product.id}
          className={`relative -mx-[3%] aspect-square w-[34%] rounded-2xl bg-zinc-100 shadow-xl ${fanClasses[index]}`}
        >
          <Image
            src={product.imageUrl}
            // The tile's link is named by the category; the packs are illustration.
            alt=""
            fill
            sizes="(min-width: 768px) 12vw, 18vw"
            className="object-contain p-[8%]"
          />
        </div>
      ))}
    </div>
  );
}

export default function CategoryShowcase({ products }: { products: CatalogProduct[] }) {
  return (
    <div dir="ltr" className="grid grid-cols-2 md:grid-cols-3 md:grid-rows-2 md:h-140">
      {tiles.map((tile) => {
        const shown = pickShowcaseProducts(products, tile.slug, PRODUCTS_PER_TILE);
        const Icon = tile.icon;
        return (
          <Link
            key={tile.slug ?? "all"}
            href={tile.slug ? `/collections/${tile.slug}` : "/products"}
            className={`group relative flex aspect-square items-end overflow-hidden bg-linear-to-br p-5 md:aspect-auto md:h-auto ${tile.gradient} ${tile.className ?? ""}`}
          >
            {shown.length > 0 ? (
              <ProductFan products={shown} />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center pb-10">
                <Icon
                  aria-hidden="true"
                  strokeWidth={1.25}
                  className="h-2/5 w-2/5 text-white/35 transition-transform duration-700 ease-out group-hover:scale-125"
                />
              </div>
            )}
            <GradientOverlay />
            <span className="relative text-lg font-bold text-white italic drop-shadow transition-colors hover:text-sky-400 sm:text-xl">
              {tile.name}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
