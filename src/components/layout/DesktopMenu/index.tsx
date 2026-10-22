"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import { ChevronDown, ChevronLeft } from "lucide-react";
import type { NavSection } from "@/lib/navigation";

// How long the panel stays open after the mouse leaves, so crossing a small
// gap between the button and the panel doesn't close it.
const CLOSE_DELAY_MS = 150;

const TOP_LINK_CLASS =
  "inline-flex cursor-pointer items-center gap-1 py-5 underline-offset-4 transition-colors hover:text-sky-500 hover:underline";

export default function DesktopMenu({ sections }: { sections: NavSection[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState(sections[0]?.id);
  const navRef = useRef<HTMLElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const activeSection = sections.find((section) => section.id === activeSectionId) ?? sections[0];

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
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setIsOpen(false);
      buttonRef.current?.focus();
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <nav ref={navRef} className="relative" aria-label="منوی اصلی">
      <ul className="flex items-center gap-7 text-sm font-medium tracking-wide text-zinc-300 uppercase">
        <li onPointerEnter={handlePointerEnter} onPointerLeave={handlePointerLeave}>
          <button
            ref={buttonRef}
            type="button"
            aria-expanded={isOpen}
            aria-controls="products-menu"
            onClick={() => setIsOpen((open) => !open)}
            className={TOP_LINK_CLASS}
          >
            محصولات
            <ChevronDown
              aria-hidden="true"
              className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
            />
          </button>

          {/* The header is dir="ltr" with the logo on the left, so the panel
              opens rightwards from the button (physical left-0); its content
              is rtl again. */}
          <div
            id="products-menu"
            dir="rtl"
            inert={!isOpen}
            className={`absolute top-full left-0 z-50 flex w-136 overflow-hidden rounded-md border border-white/10 bg-zinc-900 text-zinc-400 shadow-2xl transition duration-200 ease-out ${
              isOpen ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-2 opacity-0"
            }`}
          >
            <ul className="w-56 shrink-0 border-e border-white/10 py-3 text-base font-bold">
              {sections.map((section) => {
                const isActive = section.id === activeSection?.id;
                return (
                  <li key={section.id}>
                    <button
                      type="button"
                      onPointerEnter={() => setActiveSectionId(section.id)}
                      onFocus={() => setActiveSectionId(section.id)}
                      onClick={() => setActiveSectionId(section.id)}
                      className={`flex w-full cursor-pointer items-center justify-between gap-4 px-6 py-3 transition-colors hover:text-white ${
                        isActive ? "text-white" : ""
                      }`}
                    >
                      <span className={isActive ? "underline underline-offset-8" : ""}>
                        {section.title}
                      </span>
                      <ChevronLeft aria-hidden="true" className="h-4 w-4" />
                    </button>
                  </li>
                );
              })}
              <li>
                <Link
                  href="/products"
                  onClick={() => setIsOpen(false)}
                  className="block px-6 py-3 transition-colors hover:text-white hover:underline hover:underline-offset-8"
                >
                  همه محصولات
                </Link>
              </li>
            </ul>

            {activeSection && (
              // Keyed by section so switching sections replays the fade-in.
              <ul
                key={activeSection.id}
                className="max-h-[60vh] flex-1 animate-[fade-in-up_0.25s_ease-out] overflow-y-auto py-3 text-sm font-bold"
              >
                {activeSection.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className="block px-6 py-2.5 transition-colors hover:text-white hover:underline hover:underline-offset-8"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    href={activeSection.viewAllHref}
                    onClick={() => setIsOpen(false)}
                    className="block px-6 py-2.5 text-sky-400 transition-colors hover:text-sky-300 hover:underline hover:underline-offset-8"
                  >
                    مشاهده همه
                  </Link>
                </li>
              </ul>
            )}
          </div>
        </li>

        <li>
          <Link href="/blogs" className={TOP_LINK_CLASS}>
            بلاگ
          </Link>
        </li>
      </ul>
    </nav>
  );
}
