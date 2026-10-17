import { describe, expect, it } from "vitest";
import { escapeHtml } from "./escapeHtml";

describe("escapeHtml", () => {
  it("leaves plain text (including Persian) unchanged", () => {
    expect(escapeHtml("علی رضایی")).toBe("علی رضایی");
  });

  it("escapes every special character", () => {
    expect(escapeHtml(`<a href="x">'&'</a>`)).toBe(
      "&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;"
    );
  });

  it("escapes & first, so existing entities aren't double-decoded", () => {
    expect(escapeHtml("&lt;")).toBe("&amp;lt;");
  });
});
