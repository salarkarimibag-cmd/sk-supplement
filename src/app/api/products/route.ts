import { getAllProducts, getProductsByCategory, searchProducts } from "@/lib/products";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const categorySlug = searchParams.get("categorySlug");
  const q = searchParams.get("q");

  if (categorySlug) {
    return Response.json(await getProductsByCategory(categorySlug));
  }
  if (q) {
    return Response.json(await searchProducts(q));
  }
  return Response.json(await getAllProducts());
}
