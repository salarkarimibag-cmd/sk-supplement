import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { getAllCategories } from "@/lib/categoryContent";
import { getAllBlogPosts } from "@/lib/blogContent";
import { getAllProducts } from "@/lib/products";

const staticRoutes = [
  "",
  "/blogs",
  "/pages/about-us",
  "/pages/contact-us",
  "/pages/faq",
  "/pages/accessibility",
  "/pages/privacy-policy",
  "/pages/refund-policy",
  "/pages/shipping-policy",
  "/pages/terms-of-service",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, blogPosts, products] = await Promise.all([
    getAllCategories(),
    getAllBlogPosts(),
    getAllProducts(),
  ]);

  const staticEntries = staticRoutes.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
  }));

  const categoryEntries = categories.map((category) => ({
    url: `${SITE_URL}/collections/${category.slug}`,
    lastModified: new Date(),
  }));

  const blogEntries = blogPosts.map((post) => ({
    url: `${SITE_URL}/blogs/${post.slug}`,
    lastModified: post.publishedAt,
  }));

  const productEntries = products.map((product) => ({
    url: `${SITE_URL}/products/${product.id}`,
    lastModified: new Date(),
  }));

  return [...staticEntries, ...categoryEntries, ...blogEntries, ...productEntries];
}
