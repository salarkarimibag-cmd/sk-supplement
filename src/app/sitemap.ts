import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { getAllCategories } from "@/lib/categoryContent";
import { getAllBlogPosts } from "@/lib/blogContent";
import { getAllProducts } from "@/lib/products";
import { buildSitemapEntries } from "@/lib/sitemapEntries";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, posts, products] = await Promise.all([
    getAllCategories(),
    getAllBlogPosts(),
    getAllProducts(),
  ]);

  return buildSitemapEntries({ siteUrl: SITE_URL, products, categories, posts });
}
