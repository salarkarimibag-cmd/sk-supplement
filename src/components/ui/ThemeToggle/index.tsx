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
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  return (
    <button
      type="button"
      aria-label={isDark ? "روشن کردن حالت روز" : "روشن کردن حالت شب"}
      onClick={toggleTheme}
      className="group cursor-pointer"
    >
      {isDark ? (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          className="h-6 w-6 transition-transform group-hover:scale-110"
        >
          <circle cx="12" cy="12" r="4.5" />
          <path
            strokeLinecap="round"
            d="M12 2.5v2M12 19.5v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2.5 12h2M19.5 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
          />
        </svg>
      ) : (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          className="h-6 w-6 transition-transform group-hover:scale-110"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20.5 14.2A8.5 8.5 0 019.8 3.5a8.5 8.5 0 1010.7 10.7z"
          />
        </svg>
      )}
    </button>
  );
}
