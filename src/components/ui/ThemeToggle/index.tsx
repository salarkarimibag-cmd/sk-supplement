"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Monitor, Moon, Sun } from "lucide-react";

type ThemeMode = "light" | "dark" | "system";

const OPTIONS = [
  { mode: "light", label: "روشن", Icon: Sun },
  { mode: "dark", label: "تیره", Icon: Moon },
  { mode: "system", label: "خودکار (مثل دستگاه)", Icon: Monitor },
] as const;

// The inline script in layout.tsx sets <html data-theme> before the first
// paint; this reads and writes the same attribute.
function readMode(): ThemeMode {
  const mode = document.documentElement.dataset.theme;
  return mode === "light" || mode === "dark" ? mode : "system";
}

function applyMode(mode: ThemeMode) {
  const root = document.documentElement;
  root.dataset.theme = mode;
  // In "system" mode the layout script's listener keeps the class in step
  // with the device from here on; this sets it right now.
  const isDark =
    mode === "dark" ||
    (mode === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  root.classList.toggle("dark", isDark);
  try {
    // "system" is stored as no choice at all, which is also what every
    // visitor starts with and what global-error.tsx reads.
    if (mode === "system") localStorage.removeItem("theme");
    else localStorage.setItem("theme", mode);
  } catch {
    // Storage unavailable: the theme still switches, it just isn't remembered.
  }
}

export default function ThemeToggle() {
  const [isOpen, setIsOpen] = useState(false);
  // Only read while the menu is open, so the server render (which can't
  // know the visitor's choice) never has to guess it.
  const [mode, setMode] = useState<ThemeMode>("system");
  const wrapperRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // A click outside or Escape closes the menu; Escape also hands focus back
  // to the button, so keyboard users don't lose their place.
  useEffect(() => {
    if (!isOpen) return;
    function onPointerDown(event: PointerEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) setIsOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  function toggleMenu() {
    if (!isOpen) setMode(readMode());
    setIsOpen(!isOpen);
  }

  function choose(next: ThemeMode) {
    applyMode(next);
    setMode(next);
    setIsOpen(false);
    buttonRef.current?.focus();
  }

  const iconClass = "h-6 w-6 transition-transform group-hover:scale-110";

  return (
    <div ref={wrapperRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-label="حالت نمایش"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={toggleMenu}
        className="group flex cursor-pointer items-center"
      >
        {/* The icon of the current mode, picked by CSS from <html data-theme>
            (set before the first paint), so it's right from the start and
            doesn't change once React hydrates. */}
        <Sun aria-hidden="true" className={`hidden ${iconClass} [[data-theme=light]_&]:block`} />
        <Moon aria-hidden="true" className={`hidden ${iconClass} [[data-theme=dark]_&]:block`} />
        <Monitor
          aria-hidden="true"
          className={`hidden ${iconClass} [[data-theme=system]_&]:block`}
        />
      </button>

      {isOpen && (
        // right-0 (not start-0/end-0) on purpose: the header is dir="ltr" and
        // the menu's own text is RTL, so a logical side would flip with
        // whichever direction applies. Anchored a little past the button's
        // right edge, the menu opens leftwards, into the screen, and still
        // fits on a 320 px phone.
        <div
          role="menu"
          aria-label="حالت نمایش"
          dir="rtl"
          className="absolute -right-3 top-full z-50 mt-3 w-max rounded-lg border border-zinc-200 bg-white p-1 text-sm whitespace-nowrap text-zinc-900 shadow-lg dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        >
          {OPTIONS.map(({ mode: option, label, Icon }) => {
            const selected = option === mode;
            return (
              <button
                key={option}
                type="button"
                role="menuitemradio"
                aria-checked={selected}
                onClick={() => choose(option)}
                className={`flex w-full cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-start hover:bg-zinc-100 dark:hover:bg-zinc-800 ${
                  selected ? "font-bold text-sky-600 dark:text-sky-400" : ""
                }`}
              >
                <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />
                <span className="flex-1">{label}</span>
                {selected && <Check aria-hidden="true" className="h-4 w-4 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
