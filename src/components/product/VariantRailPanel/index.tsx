"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";

/** The share of the photo that must be on screen for the panel to open itself. */
const PHOTO_VISIBLE_RATIO = 0.7;

/** How far (px) the page may scroll after the panel opened before it fades away. */
const SCROLL_CLOSE_DISTANCE = 60;

const GLASS =
  "border border-white/50 bg-white/65 shadow-lg shadow-black/10 backdrop-blur-lg dark:border-white/10 dark:bg-zinc-900/65";

/** Where a closed list slides to: out past the edge of the photo it hangs from. */
const CLOSED_SHIFT = {
  start: "ltr:-translate-x-8 rtl:translate-x-8",
  end: "ltr:translate-x-8 rtl:-translate-x-8",
};

interface VariantRailPanelProps {
  /** The name on the handle, e.g. «طعم». */
  label: string;
  /** Which edge of the photo the panel hangs from. */
  side: "start" | "end";
  /** Keeps the panel steady while the photo sweeps during a variant switch. */
  viewTransitionName: string;
  children: ReactNode;
}

/**
 * A glass list that slides in from the side of the product photo on mobile.
 * It opens by itself while the whole photo is on screen and fades away once
 * the shopper scrolls; the handle opens and closes it by hand. It must sit
 * inside the (relatively positioned) photo, which it watches.
 */
export default function VariantRailPanel({
  label,
  side,
  viewTransitionName,
  children,
}: VariantRailPanelProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const scrollAnchor = useRef(0);
  const [open, setOpen] = useState(false);
  const listId = useId();

  useEffect(() => {
    const photo = rootRef.current?.parentElement;
    if (!photo) return;

    // Fires on load and whenever the photo crosses the thresholds, so the
    // panel opens with the photo and closes once it has mostly scrolled away.
    const observer = new IntersectionObserver(
      ([entry]) => {
        scrollAnchor.current = window.scrollY;
        setOpen(entry.intersectionRatio >= PHOTO_VISIBLE_RATIO);
      },
      { threshold: [0, PHOTO_VISIBLE_RATIO] }
    );
    observer.observe(photo);

    function closeOnScroll() {
      if (Math.abs(window.scrollY - scrollAnchor.current) > SCROLL_CLOSE_DISTANCE) setOpen(false);
    }
    window.addEventListener("scroll", closeOnScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", closeOnScroll);
    };
  }, []);

  function toggle() {
    scrollAnchor.current = window.scrollY;
    setOpen((current) => !current);
  }

  return (
    <div
      ref={rootRef}
      style={{ viewTransitionName }}
      className={`pointer-events-none absolute inset-y-3 z-10 flex items-center gap-1 lg:hidden ${
        side === "start" ? "start-0" : "end-0 flex-row-reverse"
      }`}
    >
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-controls={listId}
        className={`pointer-events-auto ${side === "start" ? "rounded-e-xl" : "rounded-s-xl"} px-1.5 py-3 text-xs font-bold text-zinc-900 [writing-mode:vertical-rl] dark:text-zinc-100 ${GLASS}`}
      >
        {label}
      </button>

      {/* inert while closed, so its links can't be tabbed to or tapped. */}
      <div
        id={listId}
        inert={!open}
        className={`pointer-events-auto max-h-full max-w-[24vw] overflow-y-auto overscroll-contain rounded-2xl p-1 transition duration-300 ease-out motion-reduce:transition-none ${GLASS} ${
          open ? "translate-x-0 opacity-100" : `opacity-0 ${CLOSED_SHIFT[side]}`
        }`}
      >
        {children}
      </div>
    </div>
  );
}
