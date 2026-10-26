import { getAllProducts, type SearchProduct } from "@/lib/products";
import { collapseGroups } from "@/lib/variants";

// The header search's suggestions: one entry per flavor/size group, like the
// product list pages. Anyone can call this, so it returns only the fields the
// suggestions show. The full document would also hand out exact stock and
// sales counts (business data) and every description, and the browser
// downloads this whenever the search opens.
export async function GET() {
  const products: SearchProduct[] = collapseGroups(await getAllProducts()).map(
    ({ id, name, imageUrl }) => ({ id, name, imageUrl })
  );
  return Response.json(products);
}
