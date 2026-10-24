"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { useReportRailOpen } from "@/components/product/VariantPhotoFrame";

/** The share of the photo that must be on screen for the rail to open itself. */
const PHOTO_VISIBLE_RATIO = 0.7;

/** How far (px) the page may scroll after the rail opened before its list fades away. */
const SCROLL_CLOSE_DISTANCE = 60;

/** Frosted, sky-tinted glass: a light-to-clear gradient, a bright rim and an inner highlight. */
const GLASS =
  "border border-white/70 bg-gradient-to-b from-sky-100/80 to-white/40 shadow-[0_8px_24px_rgba(14,116,144,0.18),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-xl backdrop-saturate-150 dark:border-white/15 dark:from-sky-300/25 dark:to-zinc-900/50 dark:shadow-[0_8px_24px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.2)]";

const ICONS: Record<string, ReactNode> = {
  flavors: <path d="M12 2.7s-6 6.3-6 10.8a6 6 0 0 0 12 0c0-4.5-6-10.8-6-10.8z" />,
  sizes: (
    <>
      <circle cx="12" cy="5" r="3" />
      <path d="M6.5 8a2 2 0 0 0-1.9 1.5L2.1 18.5A2 2 0 0 0 4 21h16a2 2 0 0 0 1.9-2.5l-2.5-9A2 2 0 0 0 17.5 8z" />
    </>
  ),
};

export interface RailTab {
  id: "flavors" | "sizes";
  /** The name under the tab's icon, e.g. «طعم». */
  label: string;
  /** The choices shown while this tab is active. */
  content: ReactNode;
}

/**
 * A glass control on the right edge of the product photo (mobile), like a
 * phone's side control strip: one button per kind of choice, and the list of
 * the active one slides out beside it. It opens by itself while the whole
 * photo is on screen and the list fades away once the shopper scrolls;
 * tapping the active button closes it by hand. It must sit inside the
 * VariantPhotoFrame, which it watches and tells when its list is open.
 */
export default function VariantRailPanel({ tabs }: { tabs: RailTab[] }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const scrollAnchor = useRef(0);
  // The tab whose list shows, which stays chosen while the list is closed.
  const [tabId, setTabId] = useState(tabs[0].id);
  const [open, setOpen] = useState(false);
  const listId = useId();
  const reportOpen = useReportRailOpen();

  const activeTab = tabs.find((tab) => tab.id === tabId) ?? tabs[0];

  useEffect(() => {
    reportOpen(open);
    return () => reportOpen(false);
  }, [reportOpen, open]);

  useEffect(() => {
    const photo = rootRef.current?.parentElement;
    if (!photo) return;

    // Fires on load and whenever the photo crosses the thresholds, so the
    // list opens with the photo and closes once it has mostly scrolled away.
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

  function choose(id: RailTab["id"]) {
    scrollAnchor.current = window.scrollY;
    // Tapping the open tab closes the list; any other tab switches to it.
    setOpen(!(open && id === activeTab.id));
    setTabId(id);
  }

  return (
    <div
      ref={rootRef}
      // Steady while the photo sweeps during a variant switch.
      style={{ viewTransitionName: "variant-rail" }}
      className="pointer-events-none absolute inset-y-3 start-0 z-10 flex items-center gap-1 lg:hidden"
    >
      <div
        role="tablist"
        aria-orientation="vertical"
        className={`pointer-events-auto flex flex-col gap-1 rounded-s-2xl p-1 ${GLASS}`}
      >
        {tabs.map((tab) => {
          const selected = open && tab.id === activeTab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={listId}
              onClick={() => choose(tab.id)}
              className={`flex size-12 flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-bold leading-none transition-colors active:scale-95 ${
                selected
                  ? "bg-gradient-to-b from-sky-500 to-sky-700 text-white shadow-md shadow-sky-700/30"
                  : "text-zinc-800 dark:text-zinc-100"
              }`}
            >
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="size-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {ICONS[tab.id]}
              </svg>
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* inert while closed, so its links can't be tabbed to or tapped. */}
      <div
        id={listId}
        role="tabpanel"
        inert={!open}
        className={`pointer-events-auto max-h-full max-w-[30vw] overflow-y-auto overscroll-contain rounded-2xl p-1 transition duration-300 ease-out motion-reduce:transition-none ${GLASS} ${
          open ? "translate-x-0 opacity-100" : "opacity-0 ltr:-translate-x-8 rtl:translate-x-8"
        }`}
      >
        {activeTab.content}
      </div>
    </div>
  );
}
