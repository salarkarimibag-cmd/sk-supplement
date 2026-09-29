"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, User, X } from "lucide-react";
import type { NavCategory } from "@/components/layout/Header";

export default function MobileMenu({ categories }: { categories: NavCategory[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [topOffset, setTopOffset] = useState(0);

  useEffect(() => {
    function measureHeader() {
      const header = document.querySelector("header");
      if (header) setTopOffset(header.getBoundingClientRect().height);
    }

    measureHeader();
    window.addEventListener("resize", measureHeader);
    return () => window.removeEventListener("resize", measureHeader);
  }, []);

  function close() {
    setIsOpen(false);
  }

  return (
    <>
      <button
        type="button"
        aria-label={isOpen ? "بستن منو" : "باز کردن منو"}
        aria-expanded={isOpen}
        onClick={() => (isOpen ? close() : setIsOpen(true))}
        className="group flex h-9 w-9 cursor-pointer items-center justify-center text-white hover:text-sky-500 md:hidden"
      >
        {isOpen ? (
          <X aria-hidden="true" className="h-6 w-6 transition-transform group-hover:scale-110" />
        ) : (
          <Menu
            aria-hidden="true"
            className="h-6 w-6 transition-transform group-hover:scale-110"
          />
        )}
      </button>

      <div
        style={{ top: topOffset }}
        aria-hidden={!isOpen}
        className={`fixed inset-x-0 bottom-0 z-40 flex flex-col bg-white transition-transform duration-300 ease-in-out md:hidden dark:bg-zinc-900 ${
          isOpen ? "translate-x-0" : "pointer-events-none translate-x-full"
        }`}
      >
        <nav dir="rtl" aria-label="منوی موبایل" className="flex-1 overflow-y-auto">
          <ul>
            {categories.map((category) => (
              <li key={category.slug}>
                <Link
                  href={`/collections/${category.slug}`}
                  onClick={close}
                  className="block px-6 py-4 text-lg transition-colors hover:bg-zinc-100 hover:text-sky-600 dark:hover:bg-zinc-800"
                >
                  {category.title}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/blogs"
                onClick={close}
                className="block px-6 py-4 text-lg transition-colors hover:bg-zinc-100 hover:text-sky-600 dark:hover:bg-zinc-800"
              >
                بلاگ
              </Link>
            </li>
          </ul>
        </nav>

        <div className="border-t border-black/[.08] bg-zinc-50 px-6 py-5 dark:border-white/8 dark:bg-zinc-800">
          <Link
            href="/account/login"
            onClick={close}
            className="flex items-center gap-2 text-sm font-semibold text-sky-500 transition-colors hover:text-sky-600"
          >
            <User aria-hidden="true" className="h-5 w-5" />
            ورود
          </Link>
        </div>
      </div>
    </>
  );
}
