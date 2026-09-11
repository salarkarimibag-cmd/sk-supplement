// TODO: fetch products for this category from /api/products?category=<slug>.
export default async function CollectionPage(props: PageProps<"/collections/[slug]">) {
  const { slug } = await props.params;

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12">
      <h1 className="text-2xl font-bold">دسته‌بندی: {slug}</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        محصولات این دسته به‌زودی نمایش داده می‌شوند.
      </p>
    </div>
  );
}
