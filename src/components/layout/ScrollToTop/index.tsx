"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

// Show the button once the visitor is past the middle of the page, but never on
// the first few hundred pixels (a short page would otherwise show it at once).
const MIN_SCROLL = 300;
// Tailwind's xl: from here the content leaves room beside it for the button
// (measured: at 1024px it still covers product cards, at 1280px nothing).
const WIDE_SCREEN = "(min-width: 80rem)";
// How far the page must move before it counts as scrolling up or down.
const DIRECTION_SLOP_PX = 10;
// The rocket's flight and the page's scroll take the same time, so they arrive together.
const LAUNCH_MS = 1000;
// Accelerating curve: the rocket starts slow and leaves fast.
const LIFT_EASING = "cubic-bezier(0.55, 0, 0.85, 0.55)";

// How long the circle takes to stretch into the rocket (the body's transition below).
const MORPH_MS = 650;

function wait(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

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
    // Phones have no margin beside the content, so while the visitor reads
    // down the page the button would sit on text and product cards. There it
    // only shows while they scroll back up, which is when they want it.
    const wide = window.matchMedia(WIDE_SCREEN);
    let lastY = window.scrollY;
    function update() {
      const y = window.scrollY;
      if (wide.matches) {
        setVisible(shouldShowButton());
      } else if (Math.abs(y - lastY) >= DIRECTION_SLOP_PX) {
        setVisible(y < lastY && shouldShowButton());
      } else {
        // A finger's jitter or the browser bar resizing isn't a change of direction.
        return;
      }
      lastY = y;
    }
    // On a new page no direction is known yet: hidden on phones.
    function reset() {
      setVisible(wide.matches && shouldShowButton());
    }
    reset();
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
      // 1. The circle stretches into a rocket (see the transitions on the body below).
      await wait(MORPH_MS);

      // 2. The engine shakes.
      await button.animate(
        [
          { transform: "translateX(0)" },
          { transform: "translateX(-1.5px)" },
          { transform: "translateX(1.5px)" },
          { transform: "translateX(0)" },
        ],
        { duration: 90, iterations: 3 },
      ).finished;

      // 3. Lift-off: the button flies off the top of the screen while the page scrolls up.
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
  // Phones keep it well off the bottom edge: the rocket's flame hangs below it.
  const aboveStickyBar = pathname.startsWith("/products/");

  return (
    <button
      ref={buttonRef}
      type="button"
      aria-label="بازگشت به بالای صفحه"
      title="بازگشت به بالا"
      inert={!visible}
      onClick={scrollToTop}
      className={`group fixed end-4 z-20 h-11 w-11 cursor-pointer rounded-full text-white transition-all duration-300 ease-out hover:-translate-y-0.5 active:scale-95 lg:end-6 lg:bottom-6 ${
        aboveStickyBar ? "bottom-30" : "bottom-10"
      } ${
        visible || launching
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      {/* The circle is the rocket's body: it stretches and gets a pointed nose
          (width, height and border-radius transition) while the launch starts.
          The circle uses 50%, not rounded-full: that is an "infinite" px radius,
          which can't be interpolated smoothly towards a percentage radius. */}
      <span
        aria-hidden="true"
        className={`absolute inset-0 m-auto overflow-hidden bg-sky-600 shadow-lg shadow-black/25 transition-[width,height,border-radius,background-color] duration-[550ms] ease-[cubic-bezier(0.34,1.35,0.5,1)] dark:bg-sky-500 ${
          launching
            ? "h-[58px] w-[26px] [border-radius:50%_50%_6px_6px/90%_90%_6px_6px]"
            : "h-11 w-11 rounded-[50%] group-hover:bg-sky-500 dark:group-hover:bg-sky-400"
        }`}
      >
        {/* Shading, so the flat circle gets a rounded, lit body once it's a rocket. */}
        <span
          className={`absolute inset-0 bg-[linear-gradient(90deg,#0ea5e9,#0284c7_60%,#0369a1)] transition-opacity duration-[400ms] ${
            launching ? "opacity-100 delay-100" : "opacity-0"
          }`}
        />
      </span>

      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`absolute inset-0 m-auto h-5 w-5 transition duration-300 ${
          launching ? "-rotate-45 scale-[0.3] opacity-0" : ""
        }`}
      >
        <path d="M12 19V5M5 12l7-7 7 7" />
      </svg>

      {/* Fins, window and flame come out of the body. The box is the rocket's
          final size (44x58) and sits 7px above the button so it's centred on it. */}
      <svg
        aria-hidden="true"
        viewBox="0 0 44 58"
        className="pointer-events-none absolute start-0 -top-[7px] h-[58px] w-11 overflow-visible"
      >
        <g
          className={`origin-top [transform-box:fill-box] transition-opacity delay-300 duration-[250ms] ${
            launching
              ? "animate-[rocket-flame_0.09s_ease-in-out_infinite_alternate] opacity-100"
              : "opacity-0"
          }`}
        >
          <path d="M17 58Q22 86 27 58Z" fill="#fb923c" />
          <path d="M19.5 58Q22 74 24.5 58Z" fill="#fff7ed" />
        </g>
        <g
          className={`origin-center [transform-box:fill-box] transition delay-200 duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
            launching ? "scale-100 opacity-100" : "scale-40 opacity-0"
          }`}
        >
          <path d="M9 40 2 56l7-4ZM35 40l7 16-7-4Z" fill="#0369a1" />
          <circle cx="22" cy="26" r="4.6" fill="#fff" />
        </g>
      </svg>

      {/* Speed streaks under the rocket while it flies. */}
      {launching &&
        [-7, 0, 7].map((offset, index) => (
          <span
            key={offset}
            aria-hidden="true"
            style={{
              marginInlineStart: offset,
              animationDelay: `${index * 60}ms`,
            }}
            className="pointer-events-none absolute top-full mt-9 h-6 w-0.5 origin-top animate-[rocket-streak_0.25s_ease-out_infinite_alternate] rounded-full bg-linear-to-b from-sky-500 to-transparent dark:from-white"
          />
        ))}
    </button>
  );
}
