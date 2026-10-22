"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Menu, User, X } from "lucide-react";
import type { HeaderUser } from "@/components/layout/Header";
import ThemeToggle from "@/components/ui/ThemeToggle";
import type { NavSection } from "@/lib/navigation";

const ITEM_CLASS =
  "decoration-2 underline-offset-8 group-hover:underline group-focus-visible:underline";

export default function MobileMenu({
  sections,
  user,
}: {
  sections: NavSection[];
  user: HeaderUser | null;
}) {
  const [isOpen, setIsOpen] = useState(false);
  // The submenu panel keeps showing its section while it slides back out, so
  // "which section" and "is the panel open" are tracked separately.
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [isSubmenuOpen, setIsSubmenuOpen] = useState(false);
  const openButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const activeSection = sections.find((section) => section.id === activeSectionId);

  function close() {
    setIsOpen(false);
    setIsSubmenuOpen(false);
  }

  function openSubmenu(sectionId: string) {
    setActiveSectionId(sectionId);
    setIsSubmenuOpen(true);
  }

  // Move focus into the drawer once it opens. This runs after the render that
  // removes `inert`; focusing in the click handler would hit a still-inert button.
  useEffect(() => {
    if (isOpen) closeButtonRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    // Stop the page behind the drawer from scrolling while it's open.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      if (isSubmenuOpen) {
        setIsSubmenuOpen(false);
      } else {
        setIsOpen(false);
        openButtonRef.current?.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isSubmenuOpen]);

  return (
    <>
      <button
        ref={openButtonRef}
        type="button"
        aria-label="باز کردن منو"
        aria-expanded={isOpen}
        aria-controls="mobile-menu"
        onClick={() => setIsOpen(true)}
        className="group flex h-9 w-9 cursor-pointer items-center justify-center text-white hover:text-sky-500 md:hidden"
      >
        <Menu aria-hidden="true" className="h-6 w-6 transition-transform group-hover:scale-110" />
      </button>

      {/* The header is dir="ltr" (for its icon order), so the drawer sets rtl
          again; that makes `inset-s-0` the right edge, where it slides in from. */}
      <div
        dir="rtl"
        inert={!isOpen}
        className={`fixed inset-0 z-60 md:hidden ${isOpen ? "" : "pointer-events-none"}`}
      >
        <div
          aria-hidden="true"
          onClick={close}
          className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
            isOpen ? "opacity-100" : "opacity-0"
          }`}
        />

        <div
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="منو"
          className={`absolute inset-y-0 inset-s-0 flex w-[85%] max-w-sm flex-col overflow-hidden bg-white text-zinc-900 shadow-2xl transition-transform duration-300 ease-out dark:bg-zinc-900 dark:text-zinc-100 ${
            isOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="px-6 pt-6">
            <button
              ref={closeButtonRef}
              type="button"
              aria-label="بستن منو"
              onClick={close}
              className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-zinc-200 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
              <X aria-hidden="true" className="h-5 w-5" />
            </button>
          </div>

          <nav aria-label="منوی اصلی" className="flex-1 overflow-y-auto px-6 py-6">
            <ul className="space-y-1 text-xl font-extrabold">
              {sections.map((section) => (
                <li key={section.id}>
                  <button
                    type="button"
                    aria-expanded={isSubmenuOpen && activeSectionId === section.id}
                    onClick={() => openSubmenu(section.id)}
                    className="group flex w-full cursor-pointer items-center justify-between py-3 outline-none"
                  >
                    <span className={ITEM_CLASS}>{section.title}</span>
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-200 transition-colors group-hover:bg-zinc-300 dark:bg-zinc-700 dark:group-hover:bg-zinc-600">
                      <ChevronLeft aria-hidden="true" className="h-4 w-4" />
                    </span>
                  </button>
                </li>
              ))}
              <li>
                <Link href="/products" onClick={close} className="group block py-3 outline-none">
                  <span className={ITEM_CLASS}>همه محصولات</span>
                </Link>
              </li>
              <li>
                <Link href="/blogs" onClick={close} className="group block py-3 outline-none">
                  <span className={ITEM_CLASS}>بلاگ</span>
                </Link>
              </li>
            </ul>
          </nav>

          <div className="mx-6 flex items-center justify-between border-t border-zinc-200 py-5 dark:border-zinc-700">
            <ThemeToggle />
            <Link
              href={user ? "/account/profile" : "/account/login"}
              onClick={close}
              className="flex items-center gap-2 text-sm font-bold transition-colors hover:text-sky-600"
            >
              <User aria-hidden="true" className="h-5 w-5" />
              {user ? "حساب کاربری" : "ورود"}
            </Link>
          </div>

          {/* Submenu: slides in from the left over the main list. */}
          <div
            inert={!isSubmenuOpen}
            className={`absolute inset-0 flex flex-col bg-white transition-transform duration-300 ease-out dark:bg-zinc-900 ${
              isSubmenuOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <div className="px-6 pt-6">
              <button
                type="button"
                onClick={() => setIsSubmenuOpen(false)}
                className="flex h-12 cursor-pointer items-center gap-2 rounded-full border border-zinc-200 ps-3 pe-5 text-sm font-bold transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
              >
                <ChevronRight aria-hidden="true" className="h-5 w-5" />
                بازگشت
              </button>
            </div>

            {activeSection && (
              <nav aria-label={activeSection.title} className="flex-1 overflow-y-auto px-6 py-6">
                <h2 className="mb-3 text-sm font-bold text-zinc-500 dark:text-zinc-400">
                  {activeSection.title}
                </h2>
                <ul className="space-y-1 text-lg font-bold">
                  {activeSection.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} onClick={close} className="group block py-2.5 outline-none">
                        <span className={ITEM_CLASS}>{link.label}</span>
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link
                      href={activeSection.viewAllHref}
                      onClick={close}
                      className="group block py-2.5 text-sky-600 outline-none dark:text-sky-400"
                    >
                      <span className={ITEM_CLASS}>مشاهده همه</span>
                    </Link>
                  </li>
                </ul>
              </nav>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
