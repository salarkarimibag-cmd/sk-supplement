"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import type { NavSection } from "@/lib/navigation";

// How long a dropdown stays open after the mouse leaves it, so a small slip
// off the edge doesn't snap it shut.
const CLOSE_DELAY_MS = 150;

const TOP_ITEM_CLASS =
  "inline-flex cursor-pointer items-center gap-1 py-5 underline-offset-4 transition-colors hover:text-sky-500 hover:underline";

/** One top-level menu item whose links drop down on hover (or click, for keyboard and touch). */
function NavDropdown({ section }: { section: NavSection }) {
  const [isOpen, setIsOpen] = useState(false);
  const itemRef = useRef<HTMLLIElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const dropdownId = `${section.id}-dropdown`;

  // Hover only applies to a real mouse. On a touchscreen a tap fires
  // pointerenter and then click, which would open and instantly re-close it.
  function handlePointerEnter(event: PointerEvent) {
    if (event.pointerType !== "mouse") return;
    clearTimeout(closeTimerRef.current);
    setIsOpen(true);
  }

  function handlePointerLeave(event: PointerEvent) {
    if (event.pointerType !== "mouse") return;
    closeTimerRef.current = setTimeout(() => setIsOpen(false), CLOSE_DELAY_MS);
  }

  useEffect(() => () => clearTimeout(closeTimerRef.current), []);

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: MouseEvent) {
      if (itemRef.current && !itemRef.current.contains(event.target as Node)) {
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
    <li
      ref={itemRef}
      className="relative"
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={dropdownId}
        onClick={() => setIsOpen((open) => !open)}
        className={TOP_ITEM_CLASS}
      >
        {section.title}
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

      {/* pt-2 (not mt-2) leaves the gap under the button inside the
          dropdown's box, so the mouse never "leaves" while crossing it. */}
      <div
        id={dropdownId}
        dir="rtl"
        inert={!isOpen}
        className={`absolute top-full right-0 z-50 origin-top-right pt-2 transition-all duration-200 ease-out ${
          isOpen ? "scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0"
        }`}
      >
        <div className="max-h-[70vh] min-w-48 overflow-y-auto rounded-2xl border border-white/20 bg-white/80 py-2 text-zinc-900 normal-case shadow-2xl backdrop-blur-md dark:border-zinc-700/50 dark:bg-zinc-900/80 dark:text-zinc-100">
          {section.links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-sm whitespace-nowrap transition-colors hover:bg-zinc-100 hover:text-sky-600 dark:hover:bg-zinc-800"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </li>
  );
}

export default function CategoryMenu({ sections }: { sections: NavSection[] }) {
  return (
    <nav aria-label="منوی اصلی">
      <ul className="flex items-center gap-7 text-sm font-medium tracking-wide text-zinc-300 uppercase">
        {sections.map((section) => (
          <NavDropdown key={section.id} section={section} />
        ))}
        <li>
          <Link href="/blogs" className={TOP_ITEM_CLASS}>
            بلاگ
          </Link>
        </li>
      </ul>
    </nav>
  );
}
