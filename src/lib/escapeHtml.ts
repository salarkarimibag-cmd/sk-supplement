/**
 * Escapes the characters that have a special meaning in HTML, so text a
 * user typed (a name, an address) shows up literally inside an HTML email
 * instead of being read as markup. Without this, a "name" such as
 * `<a href="https://evil.example">...` would turn into a real link in the
 * email the shop sends.
 */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
