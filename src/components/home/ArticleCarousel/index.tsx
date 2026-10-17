"use client";

import { useEffect, useState, type FocusEvent, type ReactNode } from "react";
import { Pause, Play } from "lucide-react";

/** How long each slide stays on screen. */
const INTERVAL_MS = 6000;
/** Delay between the cards of one slide fading in, for a staggered entrance. */
const STAGGER_MS = 150;

interface ArticleCarouselProps {
  /** Each slide is a group of article cards, already rendered on the server. */
  slides: ReactNode[][];
}

/**
 * Cycles through the slides every few seconds with a cross-fade.
 *
 * All slides are stacked in the same grid cell, so the box is as tall as the
 * tallest slide and the page below never jumps. Only the active slide is
 * visible; the others are `inert` so their links can't be clicked or tabbed to.
 *
 * Rotation pauses while the pointer or keyboard focus is inside, when the
 * pause button is pressed, and never starts for users who prefer reduced
 * motion (they can still switch slides with the dots).
 */
export default function ArticleCarousel({ slides }: ArticleCarouselProps) {
  const [active, setActive] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);

  useEffect(() => {
    if (isPaused || isInteracting) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // A timeout (not an interval) restarts whenever `active` changes, so
    // picking a slide with a dot gives it the full interval too.
    const timeout = setTimeout(
      () => setActive((index) => (index + 1) % slides.length),
      INTERVAL_MS
    );
    return () => clearTimeout(timeout);
  }, [active, isPaused, isInteracting, slides.length]);

  function handleBlur(event: FocusEvent<HTMLDivElement>) {
    // Blur also fires when focus moves between elements inside; only resume
    // once it has left the carousel.
    if (!event.currentTarget.contains(event.relatedTarget)) setIsInteracting(false);
  }

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="آخرین مقالات"
      onMouseEnter={() => setIsInteracting(true)}
      onMouseLeave={() => setIsInteracting(false)}
      onFocus={() => setIsInteracting(true)}
      onBlur={handleBlur}
    >
      {/* Announce slide changes only when they come from the user, not the timer. */}
      <div className="grid" aria-live={isPaused ? "polite" : "off"}>
        {slides.map((cards, slideIndex) => {
          const isActive = slideIndex === active;
          return (
            <div
              key={slideIndex}
              inert={!isActive}
              aria-hidden={!isActive}
              className={`col-start-1 row-start-1 grid grid-cols-1 gap-8 sm:grid-cols-2 ${
                isActive ? "" : "pointer-events-none"
              }`}
            >
              {cards.map((card, cardIndex) => (
                <div
                  key={cardIndex}
                  // Only the incoming cards are staggered; outgoing ones leave together.
                  style={{ transitionDelay: isActive ? `${cardIndex * STAGGER_MS}ms` : "0ms" }}
                  className={`transition duration-700 ease-out ${
                    isActive ? "translate-y-0 scale-100 opacity-100" : "translate-y-4 scale-[0.98] opacity-0"
                  }`}
                >
                  {card}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex items-center justify-center gap-1">
        {slides.map((_, slideIndex) => (
          <button
            key={slideIndex}
            type="button"
            aria-label={`نمایش اسلاید ${(slideIndex + 1).toLocaleString("fa-IR")}`}
            aria-current={slideIndex === active}
            onClick={() => setActive(slideIndex)}
            // The padding makes the tap target bigger than the visible dot.
            className="group cursor-pointer p-1.5"
          >
            <span
              className={`block h-2 rounded-full transition-all duration-300 ${
                slideIndex === active
                  ? "w-8 bg-sky-600"
                  : "w-2 bg-zinc-300 group-hover:bg-zinc-400 dark:bg-zinc-700 dark:group-hover:bg-zinc-600"
              }`}
            />
          </button>
        ))}

        <button
          type="button"
          aria-label={isPaused ? "ادامه‌ی چرخش" : "توقف چرخش"}
          onClick={() => setIsPaused((paused) => !paused)}
          className="ms-2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-sky-600 dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
