"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  // Animations stay off until the saved theme has been applied, so the knob
  // doesn't slide on page load.
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    function syncTheme() {
      setIsDark(document.documentElement.classList.contains("dark"));
    }
    syncTheme();
    // Two frames: the synced position must be painted before transitions turn on.
    let second = 0;
    const first = requestAnimationFrame(() => {
      second = requestAnimationFrame(() => setAnimated(true));
    });
    return () => {
      cancelAnimationFrame(first);
      cancelAnimationFrame(second);
    };
  }, []);

  function toggleTheme() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      // Storage unavailable: the theme still switches, it just isn't remembered.
    }
  }

  return (
    // dir="ltr" keeps the knob's movement the same in the RTL page: off = left, on = right.
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label="حالت شب"
      dir="ltr"
      onClick={toggleTheme}
      className={`relative h-7 w-12 shrink-0 cursor-pointer rounded-full ${
        animated ? "transition-colors duration-300" : ""
      } ${
        isDark ? "bg-sky-500" : "bg-neutral-500"
      }`}
    >
      <span
        className={`absolute start-0.5 top-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-white text-neutral-800 shadow-md ${
          animated ? "transition-transform duration-300" : ""
        } ${
          isDark ? "translate-x-5" : "translate-x-0"
        }`}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          className={`absolute h-4 w-4 text-amber-500 ${
            animated ? "transition-all duration-300" : ""
          } ${
            isDark ? "scale-0 -rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100"
          }`}
        >
          <circle cx="12" cy="12" r="4.5" fill="currentColor" />
          <path
            strokeLinecap="round"
            d="M12 2.5v2M12 19.5v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2.5 12h2M19.5 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
          />
        </svg>
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          className={`absolute h-4 w-4 text-black ${
            animated ? "transition-all duration-300" : ""
          } ${
            isDark ? "scale-100 rotate-0 opacity-100" : "scale-0 rotate-90 opacity-0"
          }`}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20.5 14.2A8.5 8.5 0 019.8 3.5a8.5 8.5 0 1010.7 10.7z"
          />
        </svg>
      </span>
    </button>
  );
}
