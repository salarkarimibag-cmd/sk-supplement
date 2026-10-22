import Image from "next/image";
import { Droplets, Dumbbell, Flame, ShoppingBag, Zap, type LucideIcon } from "lucide-react";
import GradientOverlay from "@/components/ui/GradientOverlay";
import ShowcaseTile from "@/components/home/ShowcaseTile";
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
  /** The colors the tile turns while active (hovered, or mid-screen on a phone). */
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

// Everything that changes when a tile is "active" is written twice: once for
// mouse hover (group-hover) and once for a phone's scroll position
// (group-data-active, set by ShowcaseTile). Classes are spelled out in full
// because Tailwind only generates classes it finds whole in the source.
const MOTION = "transition duration-700 ease-out";

// The cards are zinc-100, the same light gray as the backdrop of the few
// photos that aren't transparent cutouts, so those blend in too.
const CARD_CLASS = "relative aspect-square rounded-2xl bg-zinc-100 shadow-xl";

// Fan positions, [left, middle, right] by number of cards: at rest the packs
// overlap; when active they spread apart and the middle one lifts.
const FAN_CLASSES: Record<number, string[]> = {
  1: ["z-10 group-hover:scale-110 group-hover:rotate-3 group-data-active:scale-110 group-data-active:rotate-3"],
  2: [
    "-rotate-6 group-hover:-translate-x-[15%] group-hover:-rotate-12 group-data-active:-translate-x-[15%] group-data-active:-rotate-12",
    "z-10 rotate-6 group-hover:translate-x-[15%] group-hover:rotate-12 group-data-active:translate-x-[15%] group-data-active:rotate-12",
  ],
  3: [
    "-rotate-8 group-hover:-translate-x-[12%] group-hover:-rotate-14 group-data-active:-translate-x-[12%] group-data-active:-rotate-14",
    "z-10 scale-115 group-hover:-translate-y-[8%] group-hover:scale-125 group-data-active:-translate-y-[8%] group-data-active:scale-125",
    "rotate-8 group-hover:translate-x-[12%] group-hover:rotate-14 group-data-active:translate-x-[12%] group-data-active:rotate-14",
  ],
};

// Shelf rows slide in alternating directions when active.
const SHELF_ROW_CLASSES = [
  "group-hover:translate-x-[6%] group-data-active:translate-x-[6%]",
  "group-hover:-translate-x-[6%] group-data-active:-translate-x-[6%]",
];

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
  const positions = FAN_CLASSES[ordered.length];

  return (
    <div className="absolute inset-0 flex items-center justify-center pb-10">
      {ordered.map((product, index) => (
        <div
          key={product.id}
          className={`mx-[-3%] w-[34%] ${CARD_CLASS} ${MOTION} ${positions[index]}`}
        >
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
    <div className="absolute inset-0 flex flex-col justify-center gap-[4%] px-[8%] pt-[6%] pb-16">
      {rows.map((row, index) => (
        <div
          key={index}
          className={`@container-size flex min-h-0 flex-1 items-center justify-center gap-[4%] ${MOTION} ${SHELF_ROW_CLASSES[index % 2]}`}
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
    // gap-px over a gray background draws hairlines between the tiles, which
    // would otherwise blend into the page while they're white (or black).
    <div
      dir="ltr"
      className="grid grid-cols-2 gap-px bg-zinc-200 md:grid-cols-3 md:grid-rows-2 md:h-140 dark:bg-zinc-800"
    >
      {tiles.map((tile) => {
        const rows = tile.rows
          .map((matches) => pickShowcaseProducts(products, matches, PRODUCTS_PER_ROW))
          .filter((row) => row.length > 0);
        const Icon = tile.icon;
        return (
          <ShowcaseTile
            key={tile.href}
            href={tile.href}
            className={`group relative flex aspect-square items-end overflow-hidden bg-white p-5 md:aspect-auto md:h-auto dark:bg-black ${tile.className ?? ""}`}
          >
            {/* Gradients can't be transitioned, so the colors are a layer that fades in. */}
            <div
              className={`absolute inset-0 bg-linear-to-br opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-data-active:opacity-100 ${tile.gradient}`}
            />
            {rows.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center pb-10">
                <Icon
                  aria-hidden="true"
                  strokeWidth={1.25}
                  className={`h-2/5 w-2/5 text-zinc-300 group-hover:scale-125 group-hover:text-white/40 group-data-active:scale-125 group-data-active:text-white/40 dark:text-zinc-700 ${MOTION}`}
                />
              </div>
            ) : tile.rows.length > 1 ? (
              <ProductShelves rows={rows} />
            ) : (
              <ProductFan products={rows[0]} />
            )}
            {/* The dark fade behind the name is only needed on the colors. */}
            <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-data-active:opacity-100">
              <GradientOverlay />
            </div>
            <span className="relative text-lg font-bold text-zinc-900 italic transition-colors duration-500 group-hover:text-white group-hover:drop-shadow group-data-active:text-white group-data-active:drop-shadow sm:text-xl dark:text-white">
              {tile.name}
            </span>
          </ShowcaseTile>
        );
      })}
    </div>
  );
}
