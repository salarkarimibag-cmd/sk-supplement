import Image from "next/image";
import Link from "next/link";

const articles = [
  {
    slug: "two-week-ab-touch-up",
    title: "برنامه‌ی دو هفته‌ای تقویت شکم",
    date: "۲ مرداد ۱۴۰۴",
    author: "SK Supplement",
    excerpt: "یک برنامه‌ی رایگان دو هفته‌ای بدون نیاز به تجهیزات، با پنج حرکت و راهنمای روز به روز.",
    imageUrl: "/images/placeholder.svg",
  },
  {
    slug: "apple-cider-vinegar",
    title: "سرکه سیب و فواید آن برای گوارش",
    date: "۱۸ تیر ۱۴۰۴",
    author: "SK Supplement",
    excerpt: "سرکه سیب چه فایده‌ای برای گوارش و کاهش وزن دارد؟ و چرا کپسول بهتر از مایع است.",
    imageUrl: "/images/placeholder.svg",
  },
];

export default function LatestArticles() {
  return (
    <div>
      <h2 className="mb-10 text-center text-3xl font-extrabold tracking-tight uppercase sm:text-4xl">
        آخرین مقالات
      </h2>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
        {articles.map((article) => (
          <Link key={article.slug} href={`/blogs/${article.slug}`} className="group block">
            <div className="relative aspect-video overflow-hidden bg-zinc-100 dark:bg-zinc-900">
              <Image
                src={article.imageUrl}
                alt={article.title}
                fill
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
            </div>
            <h3 className="mt-4 text-xl font-bold text-zinc-900 transition-colors group-hover:text-sky-600 dark:text-zinc-100">
              {article.title}
            </h3>
            <p className="mt-1 text-xs font-bold tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
              {article.date} <span className="mx-1">•</span> {article.author}
            </p>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{article.excerpt}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
