"use client";

import { useState, type ReactNode } from "react";
import Collapsible from "@/components/ui/Collapsible";

interface ShowMoreArticlesProps {
  /** The extra article cards, already rendered on the server. */
  children: ReactNode;
}

/**
 * Keeps the extra articles collapsed until the button is pressed, then eases
 * them in. Only the open/closed state lives here; the cards themselves come in
 * as `children` from the Server Component, so they stay server-rendered.
 */
export default function ShowMoreArticles({ children }: ShowMoreArticlesProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Collapsible open={isOpen} id="more-articles">
        {/* Padding, not margin, so the gap animates with the height. */}
        <div className="pt-8">{children}</div>
      </Collapsible>

      <div className="mt-8 text-center">
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls="more-articles"
          onClick={() => setIsOpen((open) => !open)}
          className="inline-block cursor-pointer rounded border border-sky-600 px-6 py-2.5 text-sm font-semibold text-sky-600 transition hover:bg-sky-600 hover:text-white"
        >
          {isOpen ? "نمایش کمتر" : "نمایش مقالات بیشتر"}
        </button>
      </div>
    </>
  );
}
