import type { Product } from "@/models/Product";

// TODO: read from MongoDB via `connectToDatabase()` instead of returning an empty list.
export async function GET() {
  const products: Product[] = [];
  return Response.json(products);
}
