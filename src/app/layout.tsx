import type { Metadata } from "next";
import SiteChrome from "@/components/layout/SiteChrome";
import CartDrawer from "@/components/cart/CartDrawer";
import SiteAnalytics from "@/components/layout/SiteAnalytics";
import { CartProvider } from "@/context/CartContext";
import { getAllCategories } from "@/lib/categoryContent";
import { getAllBrands } from "@/lib/products";
import { DEFAULT_SHARE_IMAGE, SHARED_OPEN_GRAPH } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";
import { geistMono, vazirmatn } from "./fonts";
import "./globals.css";

const siteTitle = "SK Supplement | فروشگاه آنلاین مکمل‌های ورزشی";
const siteDescription =
  "فروشگاه آنلاین مکمل‌های ورزشی اصل از برندهای معتبر: پروتئین، کراتین، آمینو، پیش‌تمرین، چربی‌سوز و ویتامین، با ضمانت اصالت کالا و ارسال به سراسر کشور.";

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
  // Pages that set their own (see pageMetadata) replace these whole objects.
  openGraph: {
    ...SHARED_OPEN_GRAPH,
    title: siteTitle,
    description: siteDescription,
    url: SITE_URL,
    images: [DEFAULT_SHARE_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: [DEFAULT_SHARE_IMAGE],
  },
};

// Runs before hydration so the correct theme applies on first paint (no flash of the wrong theme).
// The visitor's choice is "light", "dark" or, with nothing saved, "system"
// (follow the device); it goes on <html data-theme> for ThemeToggle, and the
// `dark` class does the styling. In "system" mode the class follows the
// device live, e.g. when a phone turns dark at night.
// localStorage can throw (blocked site data, some private modes), and an
// uncaught error here would stop the script before the class is set, so a
// failed read just falls back to the system preference.
const themeInitScript = `
  (function () {
    var root = document.documentElement;
    var media = window.matchMedia("(prefers-color-scheme: dark)");
    var stored = null;
    try {
      stored = localStorage.getItem("theme");
    } catch (error) {}
    root.dataset.theme = stored === "light" || stored === "dark" ? stored : "system";
    function apply() {
      var mode = root.dataset.theme;
      root.classList.toggle("dark", mode === "dark" || (mode === "system" && media.matches));
    }
    apply();
    media.addEventListener("change", apply);
  })();
`;

// Nothing here reads the request (the logged-in user comes to the header
// from the browser, see useSessionUser), so pages without request-time data
// of their own are prerendered and served from the CDN. Their menu and
// content are rebuilt at most this often (seconds), or at once after an
// admin change (src/lib/revalidate.ts).
export const revalidate = 3600;

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [allCategories, brands] = await Promise.all([getAllCategories(), getAllBrands()]);
  // getAllCategories() also carries Mongoose-specific fields (e.g. `_id` as
  // an ObjectId, which has a toJSON method) that React can't pass across the
  // server/client boundary, so only plain fields go through.
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
          <SiteChrome categories={categories} brands={brands}>
            {children}
          </SiteChrome>
          <CartDrawer />
        </CartProvider>
        <SiteAnalytics />
      </body>
    </html>
  );
}
