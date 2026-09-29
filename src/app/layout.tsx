import type { Metadata } from "next";
import { Geist_Mono, Vazirmatn } from "next/font/google";
import SiteChrome from "@/components/layout/SiteChrome";
import CartDrawer from "@/components/cart/CartDrawer";
import { CartProvider } from "@/context/CartContext";
import { getSessionUser } from "@/lib/auth";
import { getAllCategories } from "@/lib/categoryContent";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const vazirmatn = Vazirmatn({
  variable: "--font-vazirmatn",
  subsets: ["arabic"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteTitle = "SK Supplement | فروشگاه آنلاین مکمل‌های ورزشی";
const siteDescription = "فروشگاه آنلاین مکمل‌های ورزشی";

export const metadata: Metadata = {
  // Lets Next.js resolve relative openGraph/twitter image paths (and other
  // page-level metadata) into absolute URLs; without it, social previews
  // silently fall back to an unrelated default host.
  metadataBase: new URL(SITE_URL),
  title: {
    default: siteTitle,
    template: "%s | SK Supplement",
  },
  description: siteDescription,
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    url: SITE_URL,
    siteName: "SK Supplement",
    images: ["/images/promo-banner.webp"],
    locale: "fa_IR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: ["/images/promo-banner.webp"],
  },
};

// Runs before hydration so the correct theme applies on first paint (no flash of the wrong theme).
const themeInitScript = `
  (function () {
    var stored = localStorage.getItem("theme");
    var isDark = stored ? stored === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.classList.toggle("dark", isDark);
  })();
`;

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [sessionUser, allCategories] = await Promise.all([getSessionUser(), getAllCategories()]);
  // getSessionUser()/getAllCategories() also carry Mongoose-specific fields
  // (e.g. `_id` as an ObjectId, which has a toJSON method) that React can't
  // pass across the server/client boundary, so only plain fields go through.
  const user = sessionUser ? { id: sessionUser.id, fullName: sessionUser.fullName } : null;
  const categories = allCategories.map((category) => ({
    slug: category.slug,
    title: category.title,
  }));

  return (
    <html
      lang="fa"
      dir="rtl"
      className={`${vazirmatn.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="flex min-h-full flex-col">
        <CartProvider>
          <SiteChrome user={user} categories={categories}>
            {children}
          </SiteChrome>
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
