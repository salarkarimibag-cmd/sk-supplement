"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    function syncTheme() {
      setIsDark(document.documentElement.classList.contains("dark"));
    }
    syncTheme();
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

  // The look comes from `dark:` variants, not from `isDark`: the inline script in
  // layout.tsx puts the `dark` class on <html> before the first paint, so the
  // switch is drawn in the right position from the start and doesn't jump
  // once React hydrates. `isDark` only drives aria-checked and the click.
  return (
    // dir="ltr" keeps the knob's movement the same in the RTL page: off = left, on = right.
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label="حالت شب"
      dir="ltr"
      onClick={toggleTheme}
      className="relative h-7 w-12 shrink-0 cursor-pointer rounded-full bg-neutral-500 transition-colors duration-300 dark:bg-sky-500"
    >
      <span className="absolute start-0.5 top-0.5 flex h-6 w-6 translate-x-0 items-center justify-center rounded-full bg-white text-neutral-800 shadow-md transition-transform duration-300 dark:translate-x-5">
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          className="absolute h-4 w-4 scale-100 rotate-0 text-amber-500 opacity-100 transition-all duration-300 dark:scale-0 dark:-rotate-90 dark:opacity-0"
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
          className="absolute h-4 w-4 scale-0 rotate-90 text-black opacity-0 transition-all duration-300 dark:scale-100 dark:rotate-0 dark:opacity-100"
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
