// TODO: fetch the product with this id from /api/products/<id>.
export default async function ProductPage(props: PageProps<"/products/[id]">) {
  const { id } = await props.params;

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12">
      <h1 className="text-2xl font-bold">جزئیات محصول: {id}</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        اطلاعات این محصول به‌زودی نمایش داده می‌شود.
      </p>
    </div>
  );
}
