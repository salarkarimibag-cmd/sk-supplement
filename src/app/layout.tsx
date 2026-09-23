import type { Metadata } from "next";
import { Geist_Mono, Vazirmatn } from "next/font/google";
import SiteChrome from "@/components/layout/SiteChrome";
import CartDrawer from "@/components/cart/CartDrawer";
import { CartProvider } from "@/context/CartContext";
import { getSessionUser } from "@/lib/auth";
import "./globals.css";

const vazirmatn = Vazirmatn({
  variable: "--font-vazirmatn",
  subsets: ["arabic"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "SK Supplement | فروشگاه آنلاین مکمل‌های ورزشی",
    template: "%s | SK Supplement",
  },
  description: "فروشگاه آنلاین مکمل‌های ورزشی",
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
  const sessionUser = await getSessionUser();
  // getSessionUser() also carries Mongoose-specific fields (e.g. `_id` as an
  // ObjectId, which has a toJSON method) that React can't pass across the
  // server/client boundary, so only the plain fields Header needs go through.
  const user = sessionUser ? { id: sessionUser.id, fullName: sessionUser.fullName } : null;

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
          <SiteChrome user={user}>{children}</SiteChrome>
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
