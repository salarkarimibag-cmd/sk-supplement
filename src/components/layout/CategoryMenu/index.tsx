"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { NavCategory } from "@/components/layout/Header";

export default function CategoryMenu({ categories }: { categories: NavCategory[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: MouseEvent) {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <nav ref={navRef} className="relative" aria-label="دسته‌بندی محصولات">
      <ul className="flex items-center gap-7 text-sm font-medium tracking-wide text-zinc-300 uppercase">
        <li>
          <button
            type="button"
            aria-expanded={isOpen}
            aria-controls="category-dropdown"
            onClick={() => setIsOpen((open) => !open)}
            className="inline-flex cursor-pointer items-center gap-1 py-5 underline-offset-4 transition-colors hover:text-sky-500 hover:underline"
          >
            دسته‌بندی‌ها
            <svg
              aria-hidden="true"
              viewBox="0 0 20 20"
              fill="currentColor"
              className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
            >
              <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          <div
            id="category-dropdown"
            dir="rtl"
            aria-hidden={!isOpen}
            className={`absolute top-full right-0 z-50 mt-2 min-w-48 origin-top-right rounded-2xl border border-white/20 bg-white/80 py-2 text-zinc-900 normal-case shadow-2xl backdrop-blur-md transition-all duration-200 ease-out dark:border-zinc-700/50 dark:bg-zinc-900/80 dark:text-zinc-100 ${
              isOpen ? "scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0"
            }`}
          >
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/collections/${category.slug}`}
                onClick={() => setIsOpen(false)}
                className="block px-4 py-2 text-sm transition-colors hover:bg-zinc-100 hover:text-sky-600 dark:hover:bg-zinc-800"
              >
                {category.title}
              </Link>
            ))}
          </div>
        </li>

        <li>
          <Link
            href="/blogs"
            className="inline-flex items-center py-5 underline-offset-4 transition-colors hover:text-sky-500 hover:underline"
          >
            بلاگ
          </Link>
        </li>
      </ul>
    </nav>
  );
}
