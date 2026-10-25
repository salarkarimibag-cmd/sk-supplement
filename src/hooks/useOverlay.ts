"use client";

import { useEffect, useRef, type RefObject } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

// How many overlays are open, so the page scroll is only restored once the
// last one closes (e.g. the cart opened from inside the mobile menu).
let openOverlays = 0;
let savedOverflow = "";
let savedGutter = "";

function lockPageScroll() {
  if (openOverlays++ > 0) return;
  const root = document.documentElement;
  savedOverflow = root.style.overflow;
  savedGutter = root.style.scrollbarGutter;
  // Hiding the scrollbar would widen the page and make it jump sideways, so
  // its space is kept, but only where it takes space (phones and some
  // systems draw it over the page instead).
  if (window.innerWidth > root.clientWidth) root.style.scrollbarGutter = "stable";
  root.style.overflow = "hidden";
}

function unlockPageScroll() {
  if (--openOverlays > 0) return;
  const root = document.documentElement;
  root.style.overflow = savedOverflow;
  root.style.scrollbarGutter = savedGutter;
}

/** The elements inside `container` that Tab can reach right now. */
function focusableIn(container: HTMLElement): HTMLElement[] {
  return [...container.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
    // Skip what's hidden (display: none, e.g. desktop-only links) or inside
    // an inert region (e.g. a closed Collapsible).
    (element) => element.getClientRects().length > 0 && !element.closest("[inert]")
  );
}

/**
 * What a panel that covers the page needs while it's open:
 * - Escape calls `onClose`.
 * - Focus moves into `containerRef` and Tab cycles inside it, so keyboard
 *   users can't land on the hidden page behind it.
 * - The page behind doesn't scroll.
 * - Once closed, focus goes back to where it was (usually the button that
 *   opened it).
 */
export function useOverlay(
  isOpen: boolean,
  onClose: () => void,
  containerRef: RefObject<HTMLElement | null>
) {
  // Kept in a ref, so a new onClose function on each render doesn't re-run
  // the effect (which would move focus back to the start every time).
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!isOpen || !container) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    // Unless focus is already inside (e.g. the menu's own toggle button),
    // start at the panel's first control.
    if (!container.contains(previouslyFocused)) focusableIn(container)[0]?.focus();
    lockPageScroll();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab" || !container) return;

      const focusable = focusableIn(container);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (!container.contains(active)) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      unlockPageScroll();
      // Back to the opener, if it's still on the page.
      if (previouslyFocused?.isConnected) previouslyFocused.focus();
    };
  }, [isOpen, containerRef]);
}
