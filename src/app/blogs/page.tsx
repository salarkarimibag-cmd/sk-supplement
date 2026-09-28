import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getAllBlogPosts } from "@/lib/blogContent";

export const metadata: Metadata = {
  title: "مقالات",
  description: "آخرین مقالات آموزشی SK Supplement درباره‌ی تغذیه و مکمل‌های ورزشی.",
};

export default async function BlogsPage() {
  const posts = await getAllBlogPosts();

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-12">
      <h1 className="text-2xl font-bold">مقالات</h1>

      {posts.length === 0 ? (
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">فهرست مقالات به‌زودی اضافه می‌شود.</p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2">
          {posts.map((post) => (
            <Link key={post.slug} href={`/blogs/${post.slug}`} className="group block">
              <div className="relative aspect-video overflow-hidden bg-zinc-100 dark:bg-zinc-900">
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  fill
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
              </div>
              <h2 className="mt-4 text-xl font-bold text-zinc-900 transition-colors group-hover:text-sky-600 dark:text-zinc-100">
                {post.title}
              </h2>
              <p className="mt-1 text-xs font-bold tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
                {new Date(post.publishedAt).toLocaleDateString("fa-IR")}{" "}
                <span className="mx-1">•</span> {post.author}
              </p>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{post.excerpt}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
