import { connectToDatabase } from "@/lib/db";
import { ProductModel, type Product } from "@/models/Product";
import type { CatalogProduct } from "@/data/catalog";

function withInStock(product: Product): CatalogProduct {
  return { ...product, inStock: product.stock > 0 };
}

export async function getAllProducts(): Promise<CatalogProduct[]> {
  await connectToDatabase();
  const products = await ProductModel.find().lean<Product[]>();
  return products.map(withInStock);
}

export async function getProductsPage(
  page: number,
  pageSize: number
): Promise<{ products: CatalogProduct[]; currentPage: number; totalPages: number }> {
  await connectToDatabase();

  const totalCount = await ProductModel.countDocuments();
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const currentPage = Math.min(Math.max(page, 1), totalPages);

  const products = await ProductModel.find()
    .sort({ name: 1 })
    .skip((currentPage - 1) * pageSize)
    .limit(pageSize)
    .lean<Product[]>();

  return { products: products.map(withInStock), currentPage, totalPages };
}

export async function getProductsByCategory(categorySlug: string): Promise<CatalogProduct[]> {
  await connectToDatabase();
  const products = await ProductModel.find({ categorySlug }).lean<Product[]>();
  return products.map(withInStock);
}

export async function getProductById(id: string): Promise<CatalogProduct | null> {
  await connectToDatabase();
  const product = await ProductModel.findOne({ id }).lean<Product | null>();
  return product ? withInStock(product) : null;
}

export async function searchProducts(query: string): Promise<CatalogProduct[]> {
  await connectToDatabase();
  const products = await ProductModel.find({ name: { $regex: query, $options: "i" } }).lean<
    Product[]
  >();
  return products.map(withInStock);
}
