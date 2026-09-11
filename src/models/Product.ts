// TODO: turn this into a Mongoose schema once `lib/db.ts` connects to MongoDB.
export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  categorySlug: string;
  imageUrl: string;
  stock: number;
}
