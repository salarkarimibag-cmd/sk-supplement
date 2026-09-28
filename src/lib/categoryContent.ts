import { connectToDatabase } from "@/lib/db";
import { CategoryModel, type Category } from "@/models/Category";

export async function getCategoryContent(slug: string): Promise<Category | null> {
  await connectToDatabase();
  return CategoryModel.findOne({ slug }).lean<Category | null>();
}

export async function getAllCategories(): Promise<Category[]> {
  await connectToDatabase();
  return CategoryModel.find().lean<Category[]>();
}
