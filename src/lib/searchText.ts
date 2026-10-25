/**
 * Where `query` first appears in `text`, ignoring upper/lower case (so
 * "whey" finds "Gold Standard Whey", as the /search page's regex does), or
 * -1. Persian has no case, so Persian text is compared as typed.
 */
export function findMatch(text: string, query: string): number {
  return text.toLowerCase().indexOf(query.toLowerCase());
}

/** Whether `text` contains `query`, ignoring upper/lower case. */
export function matchesQuery(text: string, query: string): boolean {
  return findMatch(text, query) !== -1;
}
