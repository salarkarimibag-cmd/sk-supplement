import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getBlogPostBySlug } from "@/lib/blogContent";

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
    </div>
  );
}
