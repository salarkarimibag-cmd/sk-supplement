"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { categories } from "@/lib/categories";

export default function CategoryMenu() {
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!openSlug) return;

    function handlePointerDown(event: MouseEvent) {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenSlug(null);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpenSlug(null);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [openSlug]);

  return (
    <nav ref={navRef} aria-label="دسته‌بندی محصولات">
      <ul className="flex flex-wrap items-center gap-7 text-sm font-medium tracking-wide text-zinc-300 uppercase">
        {categories.map((category) => {
          const isOpen = openSlug === category.slug;

          if (!category.columns) {
            return (
              <li key={category.slug}>
                <Link
                  href={`/collections/${category.slug}`}
                  className="inline-flex items-center py-5 underline-offset-4 transition-colors hover:text-sky-500 hover:underline"
                >
                  {category.name}
                </Link>
              </li>
            );
          }

          return (
            <li key={category.slug}>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`mega-menu-${category.slug}`}
                onClick={() => setOpenSlug(isOpen ? null : category.slug)}
                className="inline-flex cursor-pointer items-center gap-0 py-5 underline-offset-4 transition-colors hover:text-white hover:underline"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className={`h-5 w-5 text-zinc-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
                <span
                  className={`border px-1 py-1 transition-colors ${
                    isOpen ? "border-white text-white underline" : "border-transparent"
                  }`}
                >
                  {category.name}
                </span>
              </button>

              {isOpen && (
                <div
                  id={`mega-menu-${category.slug}`}
                  dir="rtl"
                  className="absolute inset-x-0 top-full z-50 border-t border-zinc-800 bg-white shadow-2xl dark:bg-zinc-900"
                >
                  <div className="mx-auto grid max-w-7xl grid-cols-3 gap-8 px-6 py-8 lg:grid-cols-6">
                    {category.columns.map((column) => (
                      <div key={column.title}>
                        <h3 className="mb-3 text-xs font-bold tracking-wide text-zinc-900 uppercase dark:text-zinc-100">
                          {column.title}
                        </h3>
                        <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                          {column.links.map((link) => (
                            <li key={link.slug}>
                              <Link
                                href={`/collections/${link.slug}`}
                                onClick={() => setOpenSlug(null)}
                                className="transition-colors hover:text-sky-600"
                              >
                                {link.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                        <Link
                          href={`/collections/${column.viewAllSlug}`}
                          onClick={() => setOpenSlug(null)}
                          className="mt-3 inline-block text-sm font-semibold text-sky-600 hover:underline"
                        >
                          مشاهده کالکشن
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
