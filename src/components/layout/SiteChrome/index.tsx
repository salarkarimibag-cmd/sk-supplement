"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

// Distraction-free checkout: hide the site header/footer there so the
// customer isn't tempted to navigate away mid-purchase.
export default function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isCheckout = pathname.startsWith("/checkout");

  return (
    <>
      {!isCheckout && <Header />}
      <main className="flex flex-1 flex-col">{children}</main>
      {!isCheckout && <Footer />}
    </>
  );
}
