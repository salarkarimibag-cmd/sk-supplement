import type { MetadataRoute } from "next";
import { SITE_NAME } from "@/lib/seo";

// What a phone uses when the site is added to its home screen. Next.js links
// this file from every page by itself.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: SITE_NAME,
    description: "فروشگاه آنلاین مکمل‌های ورزشی",
    lang: "fa",
    dir: "rtl",
    start_url: "/",
    display: "standalone",
    // The dark card of the logo, so the splash screen and the icon match.
    background_color: "#0a0a0a",
    theme_color: "#0a0a0a",
    icons: [
      { src: "/images/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/images/icon-512.png", sizes: "512x512", type: "image/png" },
      // The art has room around it, so the same file survives Android's
      // cropping to a circle or rounded square.
      { src: "/images/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
