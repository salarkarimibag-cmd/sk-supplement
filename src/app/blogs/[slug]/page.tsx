import type { Metadata } from "next";

// TODO: replace with the real post title once blogs are wired up to the database.
export async function generateMetadata(
  props: PageProps<"/blogs/[slug]">
): Promise<Metadata> {
  const { slug } = await props.params;
  return { title: slug };
}

// TODO: fetch the blog post with this slug from the database once blogs are wired up.
export default async function BlogPostPage(props: PageProps<"/blogs/[slug]">) {
  const { slug } = await props.params;

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-12">
      <h1 className="text-2xl font-bold">مقاله: {slug}</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">محتوای این مقاله به‌زودی اضافه می‌شود.</p>
    </div>
  );
}
