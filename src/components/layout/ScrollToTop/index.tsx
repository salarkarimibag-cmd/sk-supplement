"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

// Show the button once the visitor is past the middle of the page, but never on
// the first few hundred pixels (a short page would otherwise show it at once).
const MIN_SCROLL = 300;

export default function ScrollToTop() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function update() {
      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight;
      setVisible(
        window.scrollY > MIN_SCROLL && window.scrollY > scrollable / 2,
      );
    }
    update();
    // Passive: the handler never calls preventDefault, so scrolling isn't blocked.
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [pathname]);

  function scrollToTop() {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  }

  // On a product page phones show a sticky add-to-cart bar (see
  // ProductDetailPanel) at the bottom, so lift the button above it there.
  const aboveStickyBar = pathname.startsWith("/products/");

  return (
    <button
      type="button"
      aria-label="بازگشت به بالای صفحه"
      title="بازگشت به بالا"
      inert={!visible}
      onClick={scrollToTop}
      className={`fixed start-4 z-20 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-sky-600 text-white shadow-lg shadow-black/25 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-sky-500 active:scale-95 lg:start-6 lg:bottom-6 dark:bg-sky-500 dark:hover:bg-sky-400 ${
        aboveStickyBar ? "bottom-24" : "bottom-4"
      } ${
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
      >
        <path d="M12 19V5M5 12l7-7 7 7" />
      </svg>
    </button>
  );
}
