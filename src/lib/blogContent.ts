import { connectToDatabase } from "@/lib/db";
import { BlogPostModel, type BlogPost } from "@/models/BlogPost";

export async function getAllBlogPosts(): Promise<BlogPost[]> {
  await connectToDatabase();
  return BlogPostModel.find().sort({ publishedAt: -1 }).lean<BlogPost[]>();
}

export async function getLatestBlogPosts(limit: number): Promise<BlogPost[]> {
  await connectToDatabase();
  return BlogPostModel.find().sort({ publishedAt: -1 }).limit(limit).lean<BlogPost[]>();
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  await connectToDatabase();
  return BlogPostModel.findOne({ slug }).lean<BlogPost | null>();
}
