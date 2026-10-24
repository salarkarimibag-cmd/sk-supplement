"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { useReportRailOpen } from "@/components/product/VariantPhotoFrame";

/** The share of the photo that must be on screen for the panel to open itself. */
const PHOTO_VISIBLE_RATIO = 0.7;

/** How far (px) the page may scroll after the panel opened before it fades away. */
const SCROLL_CLOSE_DISTANCE = 60;

/** Frosted, sky-tinted glass: a light-to-clear gradient, a bright rim and an inner highlight. */
const GLASS =
  "border border-white/70 bg-gradient-to-b from-sky-100/80 to-white/40 shadow-[0_8px_24px_rgba(14,116,144,0.18),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-xl backdrop-saturate-150 dark:border-white/15 dark:from-sky-300/25 dark:to-zinc-900/50 dark:shadow-[0_8px_24px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.2)]";

/** Where a closed list slides to: out past the edge of the photo it hangs from. */
const CLOSED_SHIFT = {
  start: "ltr:-translate-x-8 rtl:translate-x-8",
  end: "ltr:translate-x-8 rtl:-translate-x-8",
};

interface VariantRailPanelProps {
  /** The name on the handle, e.g. «طعم». */
  label: string;
  /** The currently chosen value, shown on the handle even while the list is closed. */
  selected?: string;
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
 * inside the VariantPhotoFrame, which it watches and tells when it is open.
 */
export default function VariantRailPanel({
  label,
  selected,
  side,
  viewTransitionName,
  children,
}: VariantRailPanelProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const scrollAnchor = useRef(0);
  const [open, setOpen] = useState(false);
  const listId = useId();
  const reportOpen = useReportRailOpen();

  useEffect(() => {
    reportOpen(side, open);
    return () => reportOpen(side, false);
  }, [reportOpen, side, open]);

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
        className={`pointer-events-auto flex max-h-full flex-col items-center gap-2 px-1.5 py-3 text-zinc-900 transition-transform active:scale-95 dark:text-zinc-100 ${
          side === "start" ? "rounded-s-2xl" : "rounded-e-2xl"
        } ${GLASS}`}
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className={`size-4 shrink-0 text-sky-600 transition-transform duration-300 dark:text-sky-300 ${
            // Points toward the photo to invite opening, back to the edge to close (physical, the site is RTL).
            (side === "start") === open ? "" : "rotate-180"
          }`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m9 6 6 6-6 6" />
        </svg>
        <span className="flex min-h-0 flex-col items-center gap-1 text-[11px] leading-none [writing-mode:vertical-rl]">
          <span className="font-bold">{label}</span>
          {selected && (
            <span className="truncate text-sky-700 dark:text-sky-300">{selected}</span>
          )}
        </span>
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
