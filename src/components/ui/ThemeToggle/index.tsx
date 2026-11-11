"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Check, Monitor, Moon, Sun } from "lucide-react";

type ThemeMode = "light" | "dark" | "system";

// In the order the desktop switch shows them, left to right: light at the
// "off" end and dark at the "on" end, like the old two-way switch.
const OPTIONS = [
  { mode: "light", label: "روشن", Icon: Sun },
  { mode: "system", label: "خودکار (مثل دستگاه)", Icon: Monitor },
  { mode: "dark", label: "تیره", Icon: Moon },
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

// The current mode as React state, kept in step with <html data-theme>
// whichever control changed it. The server can't know the visitor's
// choice, so it renders "system"; the look never depends on this value
// (CSS reads data-theme), only the checked states do, so nothing jumps.
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}

function useThemeMode(): ThemeMode {
  return useSyncExternalStore(subscribe, readMode, () => "system");
}

/**
 * Desktop: the old pill switch, with three stops instead of two. Each stop
 * is a radio button, so clicking one picks it and the arrow keys move
 * between them; the knob slides to the chosen one.
 */
function ThemeSwitch() {
  const mode = useThemeMode();

  return (
    <div
      role="radiogroup"
      aria-label="حالت نمایش"
      // dir="ltr" keeps the knob's movement the same in the RTL page: light
      // on the left, dark on the right, like the old switch.
      dir="ltr"
      className="relative flex h-7 w-[84px] shrink-0 items-center gap-1 rounded-full bg-neutral-500 p-0.5 transition-colors duration-300 dark:bg-sky-500"
    >
      {/* The knob: placed by CSS from <html data-theme>, so it's in the right
          stop from the first paint. 28px per stop (24px + the 4px gap).
          Drawn above the stops' faint icons (z-10), but clicks go through
          it to the stop underneath (pointer-events-none). */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-0.5 left-0.5 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-md transition-transform duration-300 [[data-theme=dark]_&]:translate-x-14 [[data-theme=system]_&]:translate-x-7"
      >
        <Sun className="hidden h-4 w-4 text-amber-500 [[data-theme=light]_&]:block" />
        <Monitor className="hidden h-4 w-4 text-neutral-700 [[data-theme=system]_&]:block" />
        <Moon className="hidden h-4 w-4 text-black [[data-theme=dark]_&]:block" />
      </span>

      {OPTIONS.map(({ mode: option, label, Icon }) => (
        <label
          key={option}
          title={label}
          className="relative flex h-6 w-6 cursor-pointer items-center justify-center rounded-full text-white/70 transition-colors hover:text-white has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-sky-400"
        >
          <input
            type="radio"
            name="theme-mode"
            value={option}
            checked={mode === option}
            onChange={() => applyMode(option)}
            aria-label={label}
            className="sr-only"
          />
          <Icon aria-hidden="true" className="h-3.5 w-3.5" />
        </label>
      ))}
    </div>
  );
}

/**
 * Phones, where the header has no room for the switch: a button showing the
 * current mode opens a menu of the three.
 */
function ThemeMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const mode = useThemeMode();
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

  function choose(next: ThemeMode) {
    applyMode(next);
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
        onClick={() => setIsOpen(!isOpen)}
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
        // right (not start/end) on purpose: the header is dir="ltr" and the
        // menu's own text is RTL, so a logical side would flip with
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

/** The header's theme control: the three-stop switch on desktop, a menu on phones. */
export default function ThemeToggle() {
  return (
    <>
      <div className="md:hidden">
        <ThemeMenu />
      </div>
      <div className="hidden md:block">
        <ThemeSwitch />
      </div>
    </>
  );
}
