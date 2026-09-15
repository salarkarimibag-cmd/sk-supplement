"use client";

import { useEffect, useRef, useState } from "react";

interface FilterDropdownProps {
  label: string;
  options: string[];
}

// TODO: wire selections up to real filtering once products carry these attributes.
export default function FilterDropdown({ label, options }: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [isOpen]);

  function toggleOption(option: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(option)) {
        next.delete(option);
      } else {
        next.add(option);
      }
      return next;
    });
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className={`flex cursor-pointer items-center gap-1 rounded px-3 py-1.5 text-sm ${
          isOpen ? "border border-zinc-900 dark:border-zinc-100" : "border border-transparent"
        }`}
      >
        {label}
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`h-4 w-4 text-zinc-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full z-20 mt-2 w-64 rounded border border-zinc-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              {selected.size} انتخاب شده
            </span>
            <button
              type="button"
              onClick={() => setSelected(new Set())}
              className="cursor-pointer text-sm text-sky-600 hover:underline"
            >
              پاک کردن
            </button>
          </div>

          <ul className="max-h-64 overflow-y-auto py-2">
            {options.map((option) => (
              <li key={option}>
                <label className="flex cursor-pointer items-center gap-3 px-4 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800">
                  <input
                    type="checkbox"
                    checked={selected.has(option)}
                    onChange={() => toggleOption(option)}
                    className="h-4 w-4 cursor-pointer accent-sky-600"
                  />
                  {option}
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
