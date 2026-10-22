import Image from "next/image";
import Link from "next/link";
import { Droplets, Dumbbell, Flame, ShoppingBag, Zap, type LucideIcon } from "lucide-react";
import GradientOverlay from "@/components/ui/GradientOverlay";
import type { CatalogProduct } from "@/data/catalog";
import { pickShowcaseProducts, type ShowcaseProduct } from "@/lib/showcase";

type ProductFilter = (product: CatalogProduct) => boolean;

const inCategory =
  (slug: string): ProductFilter =>
  (product) =>
    product.categorySlug === slug;

interface Tile {
  href: string;
  name: string;
  /** Background behind the product photos. */
  gradient: string;
  /** Shown instead of photos while the tile has none yet. */
  icon: LucideIcon;
  /**
   * Products the tile shows. One entry draws a fan of packs; several draw
   * one shelf row each (the "all products" tile).
   */
  rows: ProductFilter[];
  className?: string;
}

const tiles: Tile[] = [
  {
    href: "/products",
    name: "مشاهده همه",
    gradient: "from-sky-400 to-blue-700",
    icon: ShoppingBag,
    // Protein, then creatine, then everything else: a glimpse of the whole shop.
    rows: [
      inCategory("protein"),
      inCategory("creatine"),
      (product) => product.categorySlug !== "protein" && product.categorySlug !== "creatine",
    ],
    className: "col-span-2 md:col-span-1 md:row-span-2",
  },
  {
    href: "/collections/fat-burner",
    name: "چربی‌سوزها",
    gradient: "from-amber-400 to-rose-600",
    icon: Flame,
    rows: [inCategory("fat-burner")],
  },
  {
    href: "/collections/aminos",
    name: "آمینو اسیدها",
    gradient: "from-lime-400 to-emerald-700",
    icon: Droplets,
    rows: [inCategory("aminos")],
  },
  {
    href: "/collections/protein",
    name: "پروتئین",
    gradient: "from-pink-300 to-rose-600",
    icon: Dumbbell,
    rows: [inCategory("protein")],
  },
  {
    href: "/collections/pre-workout",
    name: "پیش‌تمرین‌ها",
    gradient: "from-yellow-400 to-orange-600",
    icon: Zap,
    rows: [inCategory("pre-workout")],
  },
];

const PRODUCTS_PER_ROW = 3;

// The cards are zinc-100, the same light gray as the backdrop of the few
// photos that aren't transparent cutouts, so those blend in too.
const CARD_CLASS = "relative aspect-square rounded-2xl bg-zinc-100 shadow-xl";

function PackImage({ product, sizes }: { product: ShowcaseProduct; sizes: string }) {
  return (
    <Image
      src={product.imageUrl}
      // The tile's link is named by the category; the packs are illustration.
      alt=""
      fill
      sizes={sizes}
      className="object-contain p-[8%]"
    />
  );
}

/** Up to three packs fanned out, best seller in the middle and in front. */
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
        <div key={product.id} className={`mx-[-3%] w-[34%] ${CARD_CLASS} ${fanClasses[index]}`}>
          <PackImage product={product} sizes="(min-width: 768px) 12vw, 18vw" />
        </div>
      ))}
    </div>
  );
}

/**
 * One row of packs per entry, like shelves; rows without photos are left out.
 *
 * Each row is a size container, so a card can be as big as the row is tall
 * (100cqh) but never wider than 28% of the row (28cqw): on a narrow, tall
 * tile the width decides, on a wide one the height does, and three cards plus
 * two 4% gaps always fit.
 */
function ProductShelves({ rows }: { rows: ShowcaseProduct[][] }) {
  return (
    <div className="absolute inset-0 flex flex-col justify-center gap-[4%] px-[8%] pt-[6%] pb-16 transition-transform duration-700 ease-out group-hover:scale-105">
      {rows.map((row, index) => (
        <div
          key={index}
          className="@container-size flex min-h-0 flex-1 items-center justify-center gap-[4%]"
        >
          {row.map((product) => (
            <div key={product.id} className={`size-[min(100cqh,28cqw)] ${CARD_CLASS}`}>
              <PackImage product={product} sizes="(min-width: 768px) 8vw, 22vw" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default function CategoryShowcase({ products }: { products: CatalogProduct[] }) {
  return (
    <div dir="ltr" className="grid grid-cols-2 md:grid-cols-3 md:grid-rows-2 md:h-140">
      {tiles.map((tile) => {
        const rows = tile.rows
          .map((matches) => pickShowcaseProducts(products, matches, PRODUCTS_PER_ROW))
          .filter((row) => row.length > 0);
        const Icon = tile.icon;
        return (
          <Link
            key={tile.href}
            href={tile.href}
            className={`group relative flex aspect-square items-end overflow-hidden bg-linear-to-br p-5 md:aspect-auto md:h-auto ${tile.gradient} ${tile.className ?? ""}`}
          >
            {rows.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center pb-10">
                <Icon
                  aria-hidden="true"
                  strokeWidth={1.25}
                  className="h-2/5 w-2/5 text-white/35 transition-transform duration-700 ease-out group-hover:scale-125"
                />
              </div>
            ) : tile.rows.length > 1 ? (
              <ProductShelves rows={rows} />
            ) : (
              <ProductFan products={rows[0]} />
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
