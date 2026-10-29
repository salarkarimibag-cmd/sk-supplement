"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import Header, { type NavCategory } from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ScrollToTop from "@/components/layout/ScrollToTop";
import { useSessionUser } from "@/hooks/useSessionUser";

// Distraction-free checkout: hide the site header/footer there so the
// customer isn't tempted to navigate away mid-purchase.
export default function SiteChrome({
  children,
  categories,
  brands,
}: {
  children: ReactNode;
  categories: NavCategory[];
  brands: string[];
}) {
  const pathname = usePathname();
  const isCheckout = pathname.startsWith("/checkout");
  const user = useSessionUser();

  return (
    <>
      {/* The first thing a keyboard user tabs to: skips the header's links.
          Hidden until focused; above the sticky header (z-50) when shown.
          The target has tabIndex -1 so focus really moves into the content. */}
      {!isCheckout && (
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[60] focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-zinc-900 focus:shadow-lg focus:ring-2 focus:ring-sky-600 dark:focus:bg-zinc-900 dark:focus:text-zinc-100"
        >
          پرش به محتوای اصلی
        </a>
      )}
      {!isCheckout && <Header user={user} categories={categories} brands={brands} />}
      <main id="main-content" tabIndex={-1} className="flex flex-1 flex-col focus:outline-none">
        {children}
      </main>
      {!isCheckout && <Footer />}
      {!isCheckout && <ScrollToTop />}
    </>
  );
}
