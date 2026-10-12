/**
 * Escapes every character that has a special meaning in a regular
 * expression, so user input can be matched literally inside one. Without
 * this, a search like "(" is an invalid pattern (a server error), and a
 * crafted pattern such as "(a+)+$" can take exponentially long to run (ReDoS).
 */
export function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
