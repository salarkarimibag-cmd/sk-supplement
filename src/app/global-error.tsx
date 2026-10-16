"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";
import { Vazirmatn } from "next/font/google";
import ErrorMessage from "@/components/layout/ErrorMessage";
import "./globals.css";

const vazirmatn = Vazirmatn({
  variable: "--font-vazirmatn",
  subsets: ["arabic"],
});

// Shown when the root layout itself fails (e.g. the database is down while it
// loads the categories). It replaces the root layout, so it brings its own
// <html>, <body>, font and global styles.
export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  // The root layout's theme script doesn't run here, so apply the saved
  // theme (or the system preference) the same way it does.
  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem("theme");
    } catch {
      // Storage unavailable: fall back to the system preference.
    }
    const isDark = stored
      ? stored === "dark"
      : window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  return (
    <html lang="fa" dir="rtl" className={`${vazirmatn.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <title>خطا | SK Supplement</title>
        <ErrorMessage error={error} retry={retry} />
      </body>
    </html>
  );
}
