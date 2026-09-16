"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { sortOptions } from "@/lib/catalogFilters";

export default function SortSelect() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get("sort") ?? "featured";

  function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString());
    if (event.target.value === "featured") {
      params.delete("sort");
    } else {
      params.set("sort", event.target.value);
    }
    params.delete("page");
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <select
      aria-label="مرتب‌سازی"
      value={current}
      onChange={handleChange}
      className="cursor-pointer bg-transparent text-sm"
    >
      {sortOptions.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
