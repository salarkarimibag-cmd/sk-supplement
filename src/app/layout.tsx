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
  // getSessionUser() returns a Mongoose lean document whose `_id` is an
  // ObjectId (has a toJSON method) — React can't pass that across the
  // server/client boundary, so we convert to a plain object first.
  const user = sessionUser ? { id: String(sessionUser._id), fullName: sessionUser.fullName } : null;

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
