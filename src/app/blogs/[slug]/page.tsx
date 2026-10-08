import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { FileDown, Lock } from "lucide-react";
import { notFound } from "next/navigation";
import { getBlogPostBySlug } from "@/lib/blogContent";
import { getSessionUser } from "@/lib/auth";

export async function generateMetadata(
  props: PageProps<"/blogs/[slug]">
): Promise<Metadata> {
  const { slug } = await props.params;
  const post = await getBlogPostBySlug(slug);
  return { title: post?.title ?? "مقاله یافت نشد", description: post?.excerpt };
}

export default async function BlogPostPage(props: PageProps<"/blogs/[slug]">) {
  const { slug } = await props.params;
  const post = await getBlogPostBySlug(slug);

  if (!post) notFound();

  const paragraphs = post.content.split("\n\n");
  const user = post.pdfUrl ? await getSessionUser() : null;

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-12">
      <div className="relative aspect-video overflow-hidden bg-zinc-100 dark:bg-zinc-900">
        <Image src={post.coverImage} alt={post.title} fill className="object-cover" />
      </div>

      <h1 className="mt-8 text-2xl font-bold sm:text-3xl">{post.title}</h1>
      <p className="mt-2 text-xs font-bold tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
        {new Date(post.publishedAt).toLocaleDateString("fa-IR")} <span className="mx-1">•</span>{" "}
        {post.author}
      </p>

      <div className="mt-6 flex flex-col gap-4 leading-relaxed text-zinc-700 dark:text-zinc-300">
        {paragraphs.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>

      {post.pdfUrl && (
        <div className="mt-8 flex flex-col items-start gap-3 border border-zinc-200 p-5 dark:border-zinc-800">
          {user ? (
            <>
              <p className="text-sm font-semibold">نسخه‌ی PDF این برنامه رو دانلود کن</p>
              <a
                href={post.pdfUrl}
                download
                className="inline-flex items-center gap-2 bg-sky-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-sky-500"
              >
                <FileDown className="h-4 w-4" />
                دانلود PDF
              </a>
            </>
          ) : (
            <>
              <p className="flex items-center gap-2 text-sm font-semibold">
                <Lock className="h-4 w-4" />
                دانلود نسخه‌ی PDF این برنامه فقط برای اعضای سایته
              </p>
              <Link
                href="/account/login"
                className="inline-flex items-center gap-2 border border-sky-600 px-5 py-2.5 text-sm font-bold text-sky-600 transition hover:bg-sky-600 hover:text-white"
              >
                ورود یا ثبت‌نام برای دانلود
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
