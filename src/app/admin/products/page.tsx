import type { Metadata } from "next";
import { getProductsPage } from "@/lib/products";
import { getAllCategories } from "@/lib/categoryContent";
import ProductManager from "@/components/admin/ProductManager";
import Pagination from "@/components/ui/Pagination";

export const metadata: Metadata = {
  title: "مدیریت محصولات",
  robots: { index: false, follow: false },
};

const PAGE_SIZE = 10;

export default async function AdminProductsPage(props: PageProps<"/admin/products">) {
  const { page: pageParam } = await props.searchParams;
  const requestedPage = Number(Array.isArray(pageParam) ? pageParam[0] : pageParam) || 1;

  const [{ products, currentPage, totalPages }, categories] = await Promise.all([
    getProductsPage(requestedPage, PAGE_SIZE),
    getAllCategories(),
  ]);

  const initialProducts = products.map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: product.price,
    categorySlug: product.categorySlug,
    imageUrl: product.imageUrl,
    brand: product.brand ?? "",
    stock: product.stock,
    flavor: product.flavor ?? "",
    size: product.size ?? "",
    groupSlug: product.groupSlug ?? "",
    servingSize: product.servingSize ?? "",
    nutritionFacts: product.nutritionFacts ?? [],
    usage: product.usage ?? "",
    warnings: product.warnings ?? "",
    manufacturerClaims: product.manufacturerClaims ?? "",
  }));

  const categoryOptions = categories.map((category) => ({
    slug: category.slug,
    title: category.title,
  }));

  function hrefForPage(page: number) {
    return page === 1 ? "/admin/products" : `/admin/products?page=${page}`;
  }

  return (
    <div>
      <h2 className="text-lg font-bold">مدیریت محصولات</h2>
      <ProductManager
        key={currentPage}
        initialProducts={initialProducts}
        categoryOptions={categoryOptions}
      />
      <Pagination currentPage={currentPage} totalPages={totalPages} hrefForPage={hrefForPage} />
    </div>
  );
}
