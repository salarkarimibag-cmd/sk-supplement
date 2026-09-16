"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { FilterOptionCount } from "@/lib/catalogFilters";

interface FilterDropdownProps {
  label: string;
  /** URL search param this dropdown reads/writes, e.g. "flavor" or "size". */
  paramName: string;
  options: FilterOptionCount[];
}

export default function FilterDropdown({ label, paramName, options }: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selected = new Set(searchParams.getAll(paramName));

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

  function pushParams(next: Set<string>) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(paramName);
    for (const value of next) params.append(paramName, value);
    params.delete("page");
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  function toggleOption(value: string) {
    const next = new Set(selected);
    if (next.has(value)) {
      next.delete(value);
    } else {
      next.add(value);
    }
    pushParams(next);
  }

  function clearAll() {
    pushParams(new Set());
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
        {selected.size > 0 && <span className="text-xs text-sky-600">({selected.size})</span>}
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
              onClick={clearAll}
              className="cursor-pointer text-sm text-sky-600 hover:underline"
            >
              پاک کردن
            </button>
          </div>

          <ul className="max-h-64 overflow-y-auto py-2">
            {options.length === 0 ? (
              <li className="px-4 py-2 text-sm text-zinc-500">گزینه‌ای موجود نیست</li>
            ) : (
              options.map((option) => (
                <li key={option.value}>
                  <label className="flex cursor-pointer items-center gap-3 px-4 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800">
                    <input
                      type="checkbox"
                      checked={selected.has(option.value)}
                      onChange={() => toggleOption(option.value)}
                      className="h-4 w-4 cursor-pointer accent-sky-600"
                    />
                    {option.value} ({option.count})
                  </label>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
