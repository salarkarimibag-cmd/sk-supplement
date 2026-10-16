import { getAllProducts, getProductsByCategory, searchProducts } from "@/lib/products";
import { collapseGroups } from "@/lib/variants";

// Lists one product per flavor/size group, like the product list pages; the
// header search dropdown reads this and only needs one entry per product.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const categorySlug = searchParams.get("categorySlug");
  const q = searchParams.get("q");

  if (categorySlug) {
    return Response.json(collapseGroups(await getProductsByCategory(categorySlug)));
  }
  if (q) {
    return Response.json(collapseGroups(await searchProducts(q)));
  }
  return Response.json(collapseGroups(await getAllProducts()));
}
