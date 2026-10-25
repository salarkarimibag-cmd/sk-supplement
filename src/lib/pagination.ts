export type PaginationItem = number | "ellipsis";

/**
 * The page links to show: the first and last page, the current page with
 * `siblings` pages on each side, and an ellipsis for each skipped run. A
 * single skipped page is shown instead of an ellipsis, since the ellipsis
 * would take its place anyway. So there are at most 5 + 2 × siblings items,
 * however many pages there are, and the row fits on a phone.
 */
export function getPaginationItems(
  currentPage: number,
  totalPages: number,
  siblings = 1
): PaginationItem[] {
  if (totalPages <= 1) return [1];
  // Every page fits within the item budget, so nothing needs hiding.
  if (totalPages <= 5 + 2 * siblings) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set([1, totalPages]);
  for (let page = currentPage - siblings; page <= currentPage + siblings; page++) {
    if (page >= 1 && page <= totalPages) pages.add(page);
  }

  const items: PaginationItem[] = [];
  let previous = 0;
  for (const page of [...pages].sort((a, b) => a - b)) {
    if (page - previous === 2) items.push(previous + 1);
    else if (page - previous > 2) items.push("ellipsis");
    items.push(page);
    previous = page;
  }
  return items;
}
