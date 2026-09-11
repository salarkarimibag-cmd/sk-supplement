import Link from "next/link";

export interface Category {
  slug: string;
  name: string;
}

// TODO: replace with categories fetched from the database
const categories: Category[] = [
  { slug: "protein", name: "پروتئین" },
  { slug: "pre-workout", name: "پره‌ورکات" },
  { slug: "vitamins", name: "ویتامین‌ها" },
  { slug: "accessories", name: "لوازم جانبی" },
];

export default function CategoryMenu() {
  return (
    <nav aria-label="دسته‌بندی محصولات">
      <ul className="flex flex-wrap gap-6 text-sm font-medium">
        {categories.map((category) => (
          <li key={category.slug}>
            <Link
              href={`/collections/${category.slug}`}
              className="text-zinc-700 transition-colors hover:text-black dark:text-zinc-300 dark:hover:text-white"
            >
              {category.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
