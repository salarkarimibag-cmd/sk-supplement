// Returns `next` only if it is a same-site path ("/blogs/abc"); otherwise the
// fallback. Rejects absolute URLs, protocol-relative ones ("//evil.com") and
// backslash tricks ("/\evil.com") to prevent open-redirect attacks.
export function getSafeRedirectPath(
  next: string | string[] | undefined,
  fallback: string
): string {
  if (typeof next !== "string") return fallback;
  if (!next.startsWith("/") || next.startsWith("//") || next.includes("\\")) return fallback;
  return next;
}
