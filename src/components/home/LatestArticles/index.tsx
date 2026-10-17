import Image from "next/image";
import Link from "next/link";
import ArticleCarousel from "@/components/home/ArticleCarousel";
import { getAllBlogPosts } from "@/lib/blogContent";
import { groupIntoSlides } from "@/lib/slides";
import type { BlogPost } from "@/models/BlogPost";

/** How many articles are shown side by side on each slide. */
const ARTICLES_PER_SLIDE = 2;

function ArticleCard({ article }: { article: BlogPost }) {
  return (
    <Link href={`/blogs/${article.slug}`} className="group block">
      <div className="relative aspect-video overflow-hidden bg-zinc-100 dark:bg-zinc-900">
        <Image
          src={article.coverImage}
          alt={article.title}
          fill
          sizes="(min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
      </div>
      <h3 className="mt-4 text-xl font-bold text-zinc-900 transition-colors group-hover:text-sky-600 dark:text-zinc-100">
        {article.title}
      </h3>
      <p className="mt-1 text-xs font-bold tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
        {new Date(article.publishedAt).toLocaleDateString("fa-IR")}{" "}
        <span className="mx-1">•</span> {article.author}
      </p>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{article.excerpt}</p>
    </Link>
  );
}

export default async function LatestArticles() {
  const articles = await getAllBlogPosts();

  if (articles.length === 0) return null;

  const slides = groupIntoSlides(articles, ARTICLES_PER_SLIDE).map((group) =>
    group.map((article) => <ArticleCard key={article.slug} article={article} />)
  );

  return (
    <div>
      <h2 className="mb-10 text-center text-3xl font-extrabold tracking-tight uppercase sm:text-4xl">
        آخرین مقالات
      </h2>

      {slides.length > 1 ? (
        <ArticleCarousel slides={slides} />
      ) : (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">{slides[0]}</div>
      )}

      <div className="mt-8 text-center">
        <Link
          href="/blogs"
          className="inline-block rounded border border-sky-600 px-6 py-2.5 text-sm font-semibold text-sky-600 transition hover:bg-sky-600 hover:text-white"
        >
          مشاهده همه مقالات
        </Link>
      </div>
    </div>
  );
}
