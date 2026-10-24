"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { useReportRailOpen } from "@/components/product/VariantPhotoFrame";

/** The share of the photo that must be on screen for the rail to open itself. */
const PHOTO_VISIBLE_RATIO = 0.7;

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

/** How long the page must be still (ms) before the rail comes back after scrolling. */
const IDLE_MS = 250;

/*
 * The tab the shopper last used, kept outside the component: a product page
 * is rebuilt when a variant is picked, and this module-level value (it
 * survives in-app navigation) keeps the same list showing after picking a
 * weight instead of jumping back to the first tab.
 */
let lastTabId: string | undefined;
const tabListeners = new Set<() => void>();

function subscribeToTab(listener: () => void) {
  tabListeners.add(listener);
  return () => {
    tabListeners.delete(listener);
  };
}

function rememberTab(id: string) {
  lastTabId = id;
  tabListeners.forEach((listener) => listener());
}

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
 * the active one slides out beside it. The rail only shows while the whole
 * photo is on screen and the page is standing still: it fades away as soon as
 * the shopper scrolls and returns, list open, once the page settles. Tapping
 * the active button closes the list by hand. It must sit inside the
 * VariantPhotoFrame, which it watches and tells when its list is open.
 */
export default function VariantRailPanel({ tabs }: { tabs: RailTab[] }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const rememberedTab = useSyncExternalStore(
    subscribeToTab,
    () => lastTabId,
    () => undefined
  );
  const [photoVisible, setPhotoVisible] = useState(false);
  const [still, setStill] = useState(true);
  // The shopper's choice for the list; every scroll resets it to open.
  const [wantOpen, setWantOpen] = useState(true);
  const listId = useId();
  const reportOpen = useReportRailOpen();

  const shown = photoVisible && still;
  const open = shown && wantOpen;
  // The list that shows; it stays chosen while the list is closed.
  const activeTab = tabs.find((tab) => tab.id === rememberedTab) ?? tabs[0];

  useEffect(() => {
    reportOpen(open);
    return () => reportOpen(false);
  }, [reportOpen, open]);

  useEffect(() => {
    const photo = rootRef.current?.parentElement;
    if (!photo) return;

    // Fires on load and whenever the photo crosses the thresholds.
    const observer = new IntersectionObserver(
      ([entry]) => setPhotoVisible(entry.intersectionRatio >= PHOTO_VISIBLE_RATIO),
      { threshold: [0, PHOTO_VISIBLE_RATIO] }
    );
    observer.observe(photo);

    let idleTimer: ReturnType<typeof setTimeout>;
    function onScroll() {
      setStill(false);
      setWantOpen(true);
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => setStill(true), IDLE_MS);
    }
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      clearTimeout(idleTimer);
    };
  }, []);

  function choose(id: RailTab["id"]) {
    // Tapping the open tab closes the list; any other tab switches to it.
    setWantOpen(!(open && id === activeTab.id));
    rememberTab(id);
  }

  return (
    <div
      ref={rootRef}
      // Steady while the photo sweeps during a variant switch.
      style={{ viewTransitionName: "variant-rail" }}
      className="pointer-events-none absolute inset-y-3 start-0 z-10 flex items-center gap-1 lg:hidden"
    >
      {/* inert while hidden, so its buttons can't be tabbed to or tapped. */}
      <div
        role="tablist"
        aria-orientation="vertical"
        inert={!shown}
        className={`pointer-events-auto flex flex-col gap-1 rounded-s-2xl p-1 transition duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${GLASS} ${
          shown ? "translate-x-0 opacity-100" : "opacity-0 ltr:-translate-x-full rtl:translate-x-full"
        }`}
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
              className={`flex size-12 flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-bold leading-none transition-[color,background-color,box-shadow,transform] duration-300 active:scale-95 ${
                selected
                  ? "bg-sky-600 text-white shadow-md shadow-sky-700/30"
                  : "bg-transparent text-zinc-800 dark:text-zinc-100"
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
        className={`pointer-events-auto max-h-full w-[30vw] overflow-y-auto overscroll-contain rounded-2xl p-1 transition duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${GLASS} ${
          open ? "translate-x-0 opacity-100" : "opacity-0 ltr:-translate-x-10 rtl:translate-x-10"
        }`}
      >
        {/* Both lists stay mounted. Switching tabs fades one out while its
            height folds away (grid rows 1fr -> 0fr) and the other unfolds. */}
        {tabs.map((tab) => {
          const current = tab.id === activeTab.id;
          return (
            <div
              key={tab.id}
              inert={!current}
              className={`grid transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
                current ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="min-h-0 overflow-hidden">{tab.content}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
