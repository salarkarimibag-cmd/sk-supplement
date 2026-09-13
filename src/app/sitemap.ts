import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

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

export default function sitemap(): MetadataRoute.Sitemap {
  return staticRoutes.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
  }));
}
