import type { Metadata } from "next";
import { getAllProducts } from "@/lib/products";
import { getAllCategories } from "@/lib/categoryContent";
import ProductManager from "@/components/admin/ProductManager";

export const metadata: Metadata = {
  title: "مدیریت محصولات",
  robots: { index: false, follow: false },
};

export default async function AdminProductsPage() {
  const [products, categories] = await Promise.all([getAllProducts(), getAllCategories()]);

  const initialProducts = products.map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: product.price,
    categorySlug: product.categorySlug,
    imageUrl: product.imageUrl,
    stock: product.stock,
    rating: product.rating,
    reviewCount: product.reviewCount,
    flavor: product.flavor ?? "",
    size: product.size ?? "",
  }));

  const categoryOptions = categories.map((category) => ({
    slug: category.slug,
    title: category.title,
  }));

  return (
    <div>
      <h2 className="text-lg font-bold">مدیریت محصولات</h2>
      <ProductManager initialProducts={initialProducts} categoryOptions={categoryOptions} />
    </div>
  );
}
