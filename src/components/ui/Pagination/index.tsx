import Link from "next/link";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  hrefForPage: (page: number) => string;
}

export default function Pagination({ currentPage, totalPages, hrefForPage }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav aria-label="صفحه‌بندی" dir="ltr" className="mt-12">
      <ul className="flex list-none items-center justify-center gap-3">
        {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
          <li key={page}>
            {page === currentPage ? (
              <span
                aria-current="page"
                className="flex h-11 w-11 cursor-not-allowed items-center justify-center text-lg font-semibold text-zinc-900 underline underline-offset-4 hover:font-normal hover:text-sky-600 dark:text-zinc-100"
              >
                {page}
              </span>
            ) : (
              <Link
                href={hrefForPage(page)}
                className="flex h-11 w-11 items-center justify-center text-lg text-zinc-500 hover:text-sky-600 hover:underline hover:underline-offset-4"
              >
                {page}
              </Link>
            )}
          </li>
        ))}

        {currentPage < totalPages && (
          <li>
            <Link
              href={hrefForPage(currentPage + 1)}
              aria-label="صفحه بعد"
              className="flex h-11 w-11 items-center justify-center text-zinc-500 hover:text-sky-600"
            >
              <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
                <path
                  fillRule="evenodd"
                  d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
}
