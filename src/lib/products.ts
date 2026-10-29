import { cache } from "react";
import { connectToDatabase } from "@/lib/db";
import { ProductModel, type Product } from "@/models/Product";
import type { CatalogProduct } from "@/data/catalog";
import { formatProductName } from "@/lib/orderEmail";
import { searchPattern } from "@/lib/searchText";
import { collapseGroups, type VariantProduct, type VariantSummary } from "@/lib/variants";

/** A product in a short list (home page, related products), one per flavor/size group. */
export type ListedProduct = CatalogProduct & { variantSummary?: VariantSummary };

/** What the header search's suggestions show of a product (see /api/products). */
export type SearchProduct = Pick<CatalogProduct, "id" | "name" | "imageUrl">;

function withInStock(product: Product): CatalogProduct {
  // .lean() skips schema defaults, so products saved before salesCount
  // existed come back without it until they're backfilled.
  return { ...product, salesCount: product.salesCount ?? 0, inStock: product.stock > 0 };
}

export async function getAllProducts(): Promise<CatalogProduct[]> {
  await connectToDatabase();
  const products = await ProductModel.find().lean<Product[]>();
  return products.map(withInStock);
}

/** Every brand that at least one product has, alphabetically, for the site menu. */
export async function getAllBrands(): Promise<string[]> {
  await connectToDatabase();
  const brands = await ProductModel.distinct<string>("brand");
  return brands.filter(Boolean).sort((a, b) => a.localeCompare(b, "fa"));
}

type ProductSort = Record<string, 1 | -1>;

/**
 * The first `limit` cards of a sorted list of products, one per flavor/size
 * group, as collapseGroups would show them for the whole list.
 *
 * MongoDB does the grouping, so the list is never short however many
 * variants the top groups have: it sorts the matching products, keeps each
 * group's first one (an ungrouped product is a group of its own), and puts
 * those back in order. Then every member of the chosen groups is read, so
 * a card's flavor and size counts cover the whole group, not just the
 * members that happened to be near the top.
 */
async function firstCards(
  filter: Record<string, unknown>,
  sort: ProductSort,
  limit: number
): Promise<ListedProduct[]> {
  await connectToDatabase();
  const leaders = await ProductModel.aggregate<{ first: Product }>([
    { $match: filter },
    { $sort: sort },
    { $group: { _id: { $ifNull: ["$groupSlug", "$id"] }, first: { $first: "$$ROOT" } } },
    // $group doesn't keep the order, so sort again by the leaders' fields.
    { $sort: Object.fromEntries(Object.entries(sort).map(([field, dir]) => [`first.${field}`, dir])) },
    { $limit: limit },
  ]);
  const cards = leaders.map(({ first }) => first);

  const groupSlugs = cards.flatMap((product) => (product.groupSlug ? [product.groupSlug] : []));
  const otherMembers = groupSlugs.length
    ? await ProductModel.find({
        groupSlug: { $in: groupSlugs },
        id: { $nin: cards.map((product) => product.id) },
      }).lean<Product[]>()
    : [];

  // Leaders first, so each stays its group's card; the rest only add to the counts.
  return collapseGroups([...cards, ...otherMembers].map(withInStock));
}

// A MongoDB ObjectId starts with its creation time, so sorting by `_id`
// descending lists the newest products first without a `createdAt` field.
export function getLatestProducts(limit: number): Promise<ListedProduct[]> {
  return firstCards({}, { _id: -1 }, limit);
}

// Ties (including products that haven't sold yet) fall back to newest first.
const bySalesThenNewest: ProductSort = { salesCount: -1, _id: -1 };

/** Only products that have actually sold; empty until the first paid order. */
export function getBestSellers(limit: number): Promise<ListedProduct[]> {
  return firstCards({ salesCount: { $gt: 0 } }, bySalesThenNewest, limit);
}

/**
 * Other products from the same category, leaving out the product's own
 * flavor/size group — those are already offered by its variant picker.
 */
export function getRelatedProducts(
  product: Pick<Product, "id" | "categorySlug" | "groupSlug">,
  limit: number
): Promise<ListedProduct[]> {
  return firstCards(
    {
      categorySlug: product.categorySlug,
      id: { $ne: product.id },
      // $ne also matches products that have no groupSlug at all.
      ...(product.groupSlug ? { groupSlug: { $ne: product.groupSlug } } : {}),
    },
    bySalesThenNewest,
    limit
  );
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

/** Every product in a flavor/size group, the given one included. */
export async function getProductGroup(groupSlug: string): Promise<VariantProduct[]> {
  await connectToDatabase();
  const products = await ProductModel.find(
    { groupSlug },
    { _id: 0, id: 1, flavor: 1, size: 1, stock: 1, imageUrl: 1 }
  ).lean<Pick<Product, "id" | "flavor" | "size" | "stock" | "imageUrl">[]>();
  return products.map(({ stock, ...product }) => ({ ...product, inStock: stock > 0 }));
}

// Wrapped in React's cache(): the product page asks for its product twice
// while rendering, in generateMetadata (for the title) and in the page, and
// this way it's one query. The memo lasts for that one server render only.
export const getProductById = cache(async (id: string): Promise<CatalogProduct | null> => {
  await connectToDatabase();
  const product = await ProductModel.findOne({ id }).lean<Product | null>();
  return product ? withInStock(product) : null;
});

/**
 * The names to show for these products on an order, with flavor and size
 * («Whey (شکلاتی، ۲kg)», as in the order emails), from one query for all of
 * them instead of one per order line. A deleted product is missing from the
 * map, so callers choose its fallback.
 */
export async function getProductNames(productIds: string[]): Promise<Map<string, string>> {
  await connectToDatabase();
  const products = await ProductModel.find(
    { id: { $in: [...new Set(productIds)] } },
    { _id: 0, id: 1, name: 1, flavor: 1, size: 1 }
  ).lean<Pick<Product, "id" | "name" | "flavor" | "size">[]>();
  return new Map(products.map((product) => [product.id, formatProductName(product)]));
}

// Long enough for any real product name; anything longer is cut, so a huge
// query string can't make every search scan do extra work.
const MAX_SEARCH_LENGTH = 100;

export async function searchProducts(query: string): Promise<CatalogProduct[]> {
  await connectToDatabase();
  // Matched as literal text (escaped, not run as a regex), and found however
  // it was typed: Arabic ي/ك, a space for a half-space, Persian digits (see
  // searchPattern), the same way the header search's suggestions match.
  const pattern = searchPattern(query.slice(0, MAX_SEARCH_LENGTH));
  const products = await ProductModel.find({ name: { $regex: pattern, $options: "i" } }).lean<
    Product[]
  >();
  return products.map(withInStock);
}

type StockLine = { productId: string; quantity: number };

/**
 * Adds `perUnit.stock * quantity` to each product's stock and
 * `perUnit.salesCount * quantity` to its sales count, in one round trip.
 * `$inc` is applied by MongoDB itself, so two orders changing the same
 * product at the same moment can't overwrite each other's change the way a
 * read-then-write in JS could.
 */
async function adjustStock(
  items: StockLine[],
  perUnit: { stock: -1 | 0 | 1; salesCount: -1 | 0 | 1 }
): Promise<void> {
  // bulkWrite rejects an empty list.
  if (items.length === 0) return;
  await connectToDatabase();
  await ProductModel.bulkWrite(
    items.map((item) => ({
      updateOne: {
        filter: { id: item.productId },
        update: {
          $inc: {
            stock: perUnit.stock * item.quantity,
            salesCount: perUnit.salesCount * item.quantity,
          },
        },
      },
    }))
  );
}

/**
 * Takes a new order's quantities out of stock, but only while every product
 * still has enough: each line is one conditional update (stock ≥ quantity),
 * so when two buyers ask for the last unit at once, MongoDB lets exactly one
 * of them have it. If a line falls short, the lines already taken are put
 * back. Returns the id of the product that fell short, or null when all were
 * reserved. Not counted as sold until the order is paid (see recordSale).
 */
export async function reserveStock(items: StockLine[]): Promise<string | null> {
  await connectToDatabase();
  const reserved: StockLine[] = [];
  for (const item of items) {
    const result = await ProductModel.updateOne(
      { id: item.productId, stock: { $gte: item.quantity } },
      { $inc: { stock: -item.quantity } }
    );
    if (result.modifiedCount !== 1) {
      await releaseStock(reserved);
      return item.productId;
    }
    reserved.push(item);
  }
  return null;
}

/** Gives back stock reserved by an order that was never paid. */
export function releaseStock(items: StockLine[]): Promise<void> {
  return adjustStock(items, { stock: 1, salesCount: 0 });
}

/** Counts a paid order's reserved quantities as sold; their stock was already taken. */
export function recordSale(items: StockLine[]): Promise<void> {
  return adjustStock(items, { stock: 0, salesCount: 1 });
}

/**
 * Takes a paid order's quantities out of stock and counts them as sold, for
 * an order that had no reservation (see onOrderPaid).
 *
 * It's deliberately unconditional: by the time this runs the buyer has
 * already paid, so the sale stands even if stock ran out meanwhile. Stock
 * then goes negative, which shows the admin which products were oversold.
 */
export function decrementStock(items: StockLine[]): Promise<void> {
  return adjustStock(items, { stock: -1, salesCount: 1 });
}

/** Puts a cancelled order's quantities back in stock and takes them off the sales count. */
export function restoreStock(items: StockLine[]): Promise<void> {
  return adjustStock(items, { stock: 1, salesCount: -1 });
}
