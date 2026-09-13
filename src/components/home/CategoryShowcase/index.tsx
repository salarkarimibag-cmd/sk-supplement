import Image from "next/image";
import Link from "next/link";
import GradientOverlay from "@/components/ui/GradientOverlay";

interface Tile {
  slug: string;
  name: string;
  image: string;
  className?: string;
}

const tiles: Tile[] = [
  {
    slug: "pre-workout",
    name: "پیش‌تمرین‌ها",
    image: "/images/category-pre-workout.webp",
    className: "col-span-2 md:col-span-1 md:row-span-2",
  },
  {
    slug: "fat-burner",
    name: "چربی‌سوزها",
    image: "/images/category-fat-burner.webp",
  },
  {
    slug: "aminos",
    name: "آمینو اسیدها",
    image: "/images/category-aminos.webp",
  },
  {
    slug: "protein",
    name: "پروتئین",
    image: "/images/category-protein.webp",
  },
  {
    slug: "shop",
    name: "مشاهده همه",
    image: "/images/category-shop-all.webp",
  },
];

export default function CategoryShowcase() {
  return (
    <div dir="ltr" className="grid grid-cols-2 md:grid-cols-3 md:grid-rows-2 md:h-[560px]">
      {tiles.map((tile) => (
        <Link
          key={tile.slug}
          href={`/collections/${tile.slug}`}
          className={`group relative flex aspect-square items-end overflow-hidden p-5 md:aspect-auto md:h-auto ${tile.className ?? ""}`}
        >
          <Image
            src={tile.image}
            alt={tile.name}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-125"
          />
          <GradientOverlay />
          <span className="relative text-lg font-bold text-white italic drop-shadow transition-colors hover:text-sky-400 sm:text-xl">
            {tile.name}
          </span>
        </Link>
      ))}
    </div>
  );
}
