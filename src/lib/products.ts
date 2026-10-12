import { connectToDatabase } from "@/lib/db";
import { ProductModel, type Product } from "@/models/Product";
import type { CatalogProduct } from "@/data/catalog";
import { escapeRegex } from "@/lib/escapeRegex";

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

// Long enough for any real product name; anything longer is cut, so a huge
// query string can't make every search scan do extra work.
const MAX_SEARCH_LENGTH = 100;

export async function searchProducts(query: string): Promise<CatalogProduct[]> {
  await connectToDatabase();
  // The query is escaped so it's matched as literal text, not run as a regex.
  const pattern = escapeRegex(query.trim().slice(0, MAX_SEARCH_LENGTH));
  const products = await ProductModel.find({ name: { $regex: pattern, $options: "i" } }).lean<
    Product[]
  >();
  return products.map(withInStock);
}

/**
 * Takes a paid order's quantities out of stock, in one round trip. `$inc`
 * is applied by MongoDB itself, so two orders paid at the same moment can't
 * overwrite each other's change the way a read-then-write in JS could.
 *
 * It's deliberately unconditional: by the time this runs the buyer has
 * already paid, so the sale stands even if stock ran out meanwhile. Stock
 * then goes negative, which shows the admin which products were oversold.
 */
export async function decrementStock(
  items: { productId: string; quantity: number }[]
): Promise<void> {
  await connectToDatabase();
  await ProductModel.bulkWrite(
    items.map((item) => ({
      updateOne: { filter: { id: item.productId }, update: { $inc: { stock: -item.quantity } } },
    }))
  );
}
