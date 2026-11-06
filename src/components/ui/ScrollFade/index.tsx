"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

// How wide the faded strip at each edge is.
const FADE = "2rem";

/**
 * A horizontally scrolling row that fades out at an edge while there is more
 * content past it, so it's clear the row scrolls (phones hide the scrollbar
 * until you touch it).
 *
 * The fade is a CSS mask: it makes the content itself transparent rather than
 * painting a gradient over it, so it works on any background, in both themes.
 */
export default function ScrollFade({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ left: false, right: false });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    function update() {
      if (!el) return;
      // In RTL, scrollLeft is 0 at the start (right edge) and goes negative
      // toward the left, so work with the distance scrolled from the start.
      const rtl = getComputedStyle(el).direction === "rtl";
      const scrolled = Math.abs(el.scrollLeft);
      const canScrollBack = scrolled > 1;
      const canScrollOn = scrolled + el.clientWidth < el.scrollWidth - 1;
      setEdges({
        left: rtl ? canScrollOn : canScrollBack,
        right: rtl ? canScrollBack : canScrollOn,
      });
    }

    update();
    el.addEventListener("scroll", update, { passive: true });
    // The row's width changes with the window; its content can change too.
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, []);

  const mask =
    edges.left || edges.right
      ? `linear-gradient(to right, ${edges.left ? "transparent" : "black"}, black ${FADE}, black calc(100% - ${FADE}), ${edges.right ? "transparent" : "black"})`
      : undefined;

  return (
    <div
      ref={ref}
      style={{ maskImage: mask, WebkitMaskImage: mask }}
      className={`scrollbar-thin-subtle overflow-x-auto ${className}`}
    >
      {children}
    </div>
  );
}
