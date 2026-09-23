"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { productsBySlug } from "@/data/catalog";

const allProducts = Object.values(productsBySlug).flat();

// Category titles are now stored in the database (src/models/Category.ts),
// but this is a client component with no direct DB access, so the small,
// rarely-changing set of category names used for search suggestions is kept
// here rather than plumbing an API call through just for this.
const categories = [
  { slug: "protein", title: "پروتئین‌ها" },
  { slug: "pre-workout", title: "پیش‌تمرین‌ها" },
  { slug: "fat-burner", title: "چربی‌سوزها" },
  { slug: "aminos", title: "آمینو اسیدها" },
];

const searchablePages = [
  { title: "درباره ما", href: "/pages/about-us" },
  { title: "تماس با ما", href: "/pages/contact-us" },
  { title: "سوالات متداول", href: "/pages/faq" },
  { title: "قوانین و مقررات", href: "/pages/terms-of-service" },
  { title: "قوانین ارسال", href: "/pages/shipping-policy" },
  { title: "قوانین بازگشت وجه", href: "/pages/refund-policy" },
  { title: "دسترس‌پذیری", href: "/pages/accessibility" },
  { title: "حریم خصوصی", href: "/pages/privacy-policy" },
];

const MAX_RESULTS = 5;

/** Renders text with the part matching the query dimmed, so the rest reads as the "completion". */
function dimMatch(text: string, query: string): ReactNode {
  if (!query) return text;
  const index = text.toLowerCase().indexOf(query.toLowerCase());
  if (index === -1) return text;
  return (
    <>
      {text.slice(0, index)}
      <span className="text-zinc-500">
        {text.slice(index, index + query.length)}
      </span>
      {text.slice(index + query.length)}
    </>
  );
}

interface ResultLinkProps {
  href: string;
  onNavigate: () => void;
  children: ReactNode;
}

function ResultLink({ href, onNavigate, children }: ResultLinkProps) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className="-mx-2 block rounded-sm px-2 py-1.5 text-base font-bold text-white hover:underline hover:underline-offset-4"
    >
      {children}
    </Link>
  );
}

interface SearchBarProps {
  onClose: () => void;
}

export default function SearchBar({ onClose }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const trimmedQuery = query.trim();

  const matchedProducts = trimmedQuery
    ? allProducts
        .filter((product) => product.name.includes(trimmedQuery))
        .slice(0, MAX_RESULTS)
    : [];
  const matchedCategories = trimmedQuery
    ? categories
        .filter((category) => category.title.includes(trimmedQuery))
        .slice(0, MAX_RESULTS)
    : [];
  const matchedPages = trimmedQuery
    ? searchablePages
        .filter((page) => page.title.includes(trimmedQuery))
        .slice(0, MAX_RESULTS)
    : [];

  useEffect(() => {
    inputRef.current?.focus();

    function handlePointerDown(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!trimmedQuery) return;
    router.push(`/search?q=${encodeURIComponent(trimmedQuery)}`);
    onClose();
  }

  const hasResults =
    matchedProducts.length > 0 ||
    matchedCategories.length > 0 ||
    matchedPages.length > 0;

  return (
    <div
      ref={containerRef}
      className="flex w-full items-center justify-center gap-4"
    >
      <div className="relative w-full max-w-2xl">
        <form
          role="search"
          onSubmit={handleSubmit}
          className="flex items-center gap-3 border border-zinc-700 px-4 py-1.5 transition-colors focus-within:border-white"
        >
          <div className="flex-1">
            <label
              htmlFor="site-search-input"
              className="block text-[10px] leading-tight tracking-wide text-zinc-400"
            >
              جستجو
            </label>
            <input
              ref={inputRef}
              id="site-search-input"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label="جستجو"
              className="w-full bg-transparent text-sm leading-tight font-bold text-white outline-none"
            />
          </div>

          {query && (
            <>
              <button
                type="button"
                aria-label="پاک کردن جستجو"
                onClick={() => setQuery("")}
                className="group flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-full border border-zinc-600 text-zinc-400 hover:border-white hover:text-white"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  className="h-3 w-3 transition-transform group-hover:scale-110"
                >
                  <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                </svg>
              </button>
              <span className="h-5 w-px shrink-0 bg-zinc-700" />
            </>
          )}

          <button
            type="submit"
            aria-label="اعمال جستجو"
            className="group shrink-0 cursor-pointer text-white"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              className="h-4 w-4 transition-transform group-hover:scale-110"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" strokeLinecap="round" />
            </svg>
          </button>
        </form>

        {trimmedQuery && (
          <div className="absolute inset-x-0 top-full z-50 max-h-[70vh] overflow-y-auto bg-black shadow-2xl">
            <div className="px-2 py-6">
              {hasResults ? (
                <div className="space-y-6">
                  {matchedCategories.length > 0 && (
                    <div>
                      <h3 className="border-b border-zinc-800 pb-2 text-xs tracking-widest text-zinc-500">
                        پیشنهادها
                      </h3>
                      <ul className="mt-3">
                        {matchedCategories.map((category) => (
                          <li key={category.slug}>
                            <ResultLink
                              href={`/collections/${category.slug}`}
                              onNavigate={onClose}
                            >
                              {dimMatch(category.title, trimmedQuery)}
                            </ResultLink>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {matchedPages.length > 0 && (
                    <div>
                      <h3 className="border-b border-zinc-800 pb-2 text-xs tracking-widest text-zinc-500">
                        صفحات
                      </h3>
                      <ul className="mt-3">
                        {matchedPages.map((page) => (
                          <li key={page.href}>
                            <ResultLink href={page.href} onNavigate={onClose}>
                              {dimMatch(page.title, trimmedQuery)}
                            </ResultLink>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {matchedProducts.length > 0 && (
                    <div>
                      <h3 className="border-b border-zinc-800 pb-2 text-xs tracking-widest text-zinc-500">
                        محصولات
                      </h3>
                      <ul className="mt-3 space-y-1">
                        {matchedProducts.map((product) => (
                          <li key={product.id}>
                            <Link
                              href={`/products/${product.id}`}
                              onClick={onClose}
                              className="-mx-2 flex items-center gap-3 rounded-sm px-2 py-1.5 hover:underline hover:underline-offset-4"
                            >
                              <span className="relative h-12 w-12 shrink-0 overflow-hidden bg-zinc-900">
                                <Image
                                  src={product.imageUrl}
                                  alt=""
                                  fill
                                  className="object-contain"
                                />
                              </span>
                              <span className="text-base font-bold text-white">
                                {dimMatch(product.name, trimmedQuery)}
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-zinc-500">
                  چیزی برای «{trimmedQuery}» پیدا نشد.
                </p>
              )}

              <Link
                href={`/search?q=${encodeURIComponent(trimmedQuery)}`}
                onClick={onClose}
                className="-mx-2 mt-6 flex items-center justify-between border-t border-zinc-800 px-2 py-4 text-sm font-bold text-white hover:bg-zinc-900"
              >
                جستجو برای «{trimmedQuery}»
                <svg
                  aria-hidden="true"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-4 w-4"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>
            </div>
          </div>
        )}
      </div>

      <button
        type="button"
        aria-label="بستن"
        onClick={onClose}
        className="group shrink-0 cursor-pointer text-zinc-400 hover:text-white"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          className="h-6 w-6 transition-transform group-hover:scale-110"
        >
          <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
