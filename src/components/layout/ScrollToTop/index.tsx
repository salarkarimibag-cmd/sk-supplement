"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

// Show the button once the visitor is past the middle of the page, but never on
// the first few hundred pixels (a short page would otherwise show it at once).
const MIN_SCROLL = 300;
// The rocket's flight and the page's scroll take the same time, so they arrive together.
const LAUNCH_MS = 1000;
// Accelerating curve: the rocket starts slow and leaves fast.
const LIFT_EASING = "cubic-bezier(0.55, 0, 0.85, 0.55)";

function shouldShowButton() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  return window.scrollY > MIN_SCROLL && window.scrollY > scrollable / 2;
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// Scrolls to the top over `duration` ms. The browser's own smooth scrolling
// picks its duration, which is far too long on a tall page. Returns a cancel function.
function scrollToTopOver(duration: number) {
  const startY = window.scrollY;
  const startTime = performance.now();
  let frame = 0;

  function stop() {
    cancelAnimationFrame(frame);
    window.removeEventListener("wheel", stop);
    window.removeEventListener("touchstart", stop);
  }
  function step(now: number) {
    const progress = Math.min((now - startTime) / duration, 1);
    window.scrollTo(0, startY * (1 - easeInOutCubic(progress)));
    if (progress < 1) frame = requestAnimationFrame(step);
    else stop();
  }

  // If the visitor grabs the page mid-flight, hand the scroll back to them.
  window.addEventListener("wheel", stop, { passive: true });
  window.addEventListener("touchstart", stop, { passive: true });
  frame = requestAnimationFrame(step);
  return stop;
}

export default function ScrollToTop() {
  const pathname = usePathname();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const launchingRef = useRef(false);
  const cancelScrollRef = useRef<(() => void) | null>(null);
  const flightRef = useRef<Animation | null>(null);
  const [visible, setVisible] = useState(false);
  const [launching, setLaunching] = useState(false);

  useEffect(() => {
    function update() {
      setVisible(shouldShowButton());
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

  // The finished flight keeps the button off-screen and invisible. Once it has
  // to show again, drop the animation so the normal fade-in plays from there.
  useEffect(() => {
    if (!visible) return;
    flightRef.current?.cancel();
    flightRef.current = null;
  }, [visible]);

  // Leaving the page mid-flight must not leave a scroll loop running.
  useEffect(() => () => cancelScrollRef.current?.(), []);

  async function scrollToTop() {
    const button = buttonRef.current;
    if (launchingRef.current || !button) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduceMotion) {
      window.scrollTo({ top: 0, behavior: "auto" });
      return;
    }

    launchingRef.current = true;
    setLaunching(true);
    try {
      // 1. The engine shakes.
      await button.animate(
        [
          { transform: "translateX(0)" },
          { transform: "translateX(-1.5px)" },
          { transform: "translateX(1.5px)" },
          { transform: "translateX(0)" },
        ],
        { duration: 90, iterations: 3 },
      ).finished;

      // 2. Lift-off: the button flies off the top of the screen while the page scrolls up.
      const distance = button.getBoundingClientRect().bottom + 20;
      cancelScrollRef.current = scrollToTopOver(LAUNCH_MS);
      const flight = button.animate(
        [
          { transform: "translateY(0) scale(1)", opacity: 1 },
          {
            transform: `translateY(${-distance * 0.8}px) scale(1.05)`,
            opacity: 1,
            offset: 0.8,
          },
          { transform: `translateY(${-distance}px) scale(0.4)`, opacity: 0 },
        ],
        { duration: LAUNCH_MS, easing: LIFT_EASING, fill: "forwards" },
      );
      await flight.finished;
      if (shouldShowButton()) {
        // The visitor stopped the scroll halfway: the button is still needed.
        flight.cancel();
      } else {
        // At the top the button stays gone until the visitor scrolls down again.
        flightRef.current = flight;
      }
    } catch {
      // The animation was cancelled (the page unmounted): nothing left to do.
    } finally {
      launchingRef.current = false;
      setLaunching(false);
    }
  }

  // On a product page phones show a sticky add-to-cart bar (see
  // ProductDetailPanel) at the bottom, so lift the button above it there.
  const aboveStickyBar = pathname.startsWith("/products/");

  return (
    <button
      ref={buttonRef}
      type="button"
      aria-label="بازگشت به بالای صفحه"
      title="بازگشت به بالا"
      inert={!visible}
      onClick={scrollToTop}
      className={`fixed start-4 z-20 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-sky-600 text-white shadow-lg shadow-black/25 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-sky-500 active:scale-95 lg:start-6 lg:bottom-6 dark:bg-sky-500 dark:hover:bg-sky-400 ${
        aboveStickyBar ? "bottom-24" : "bottom-4"
      } ${
        visible || launching
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      {launching ? (
        <>
          {/* Speed streaks under the rocket. */}
          {[-7, 0, 7].map((offset, index) => (
            <span
              key={offset}
              aria-hidden="true"
              style={{
                marginInlineStart: offset,
                animationDelay: `${index * 60}ms`,
              }}
              className="pointer-events-none absolute top-full mt-1 h-6 w-0.5 origin-top animate-[rocket-streak_0.25s_ease-out_infinite_alternate] rounded-full bg-linear-to-b from-sky-500 to-transparent dark:from-white"
            />
          ))}
          <svg
            aria-hidden="true"
            viewBox="0 0 32 52"
            className="h-7 w-4 overflow-visible"
          >
            <g className="origin-top animate-[rocket-flame_0.09s_ease-in-out_infinite_alternate] [transform-box:fill-box]">
              <path d="M12.5 45Q16 64 19.5 45Z" fill="#fb923c" />
              <path d="M14 45Q16 56 18 45Z" fill="#fde047" />
            </g>
            <path
              d="M8 31 2 44l9-5ZM24 31l6 13-9-5Z"
              fill="#0284c7"
              stroke="#075985"
            />
            <path
              d="M16 2c9 9 9 28 6 40H10C7 30 7 11 16 2Z"
              fill="#fff"
              stroke="#075985"
              strokeWidth={1.4}
            />
            <circle
              cx="16"
              cy="19"
              r="4.2"
              fill="#38bdf8"
              stroke="#075985"
              strokeWidth={1.4}
            />
            <path d="M11 42h10l-1.5 3h-7Z" fill="#475569" />
          </svg>
        </>
      ) : (
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
      )}
    </button>
  );
}
