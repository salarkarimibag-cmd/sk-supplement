import { describe, expect, it } from "vitest";
import { findMatch, matchesQuery, normalizeSearchText, searchPattern } from "./searchText";

describe("matchesQuery", () => {
  it("ignores upper/lower case in Latin names", () => {
    expect(matchesQuery("Gold Standard 100% Whey", "whey")).toBe(true);
    expect(matchesQuery("Gold Standard 100% Whey", "WHEY")).toBe(true);
    expect(matchesQuery("Nitro-Tech", "nitro-tech")).toBe(true);
  });

  it("matches Persian text and mixed names", () => {
    expect(matchesQuery("وی گلد استاندارد - Gold Standard", "گلد")).toBe(true);
    expect(matchesQuery("وی گلد استاندارد - Gold Standard", "gold")).toBe(true);
  });

  it("finds Persian ی and ک when typed on an Arabic keyboard", () => {
    expect(matchesQuery("کراتین مونوهیدرات", "كراتين")).toBe(true);
  });

  it("treats a space and a half-space as the same", () => {
    expect(matchesQuery("سی‌فور اورجینال", "سی فور")).toBe(true);
    expect(matchesQuery("پیش تمرین", "پیش‌تمرین")).toBe(true);
  });

  it("treats Persian and English digits as the same", () => {
    expect(matchesQuery("Gold Standard 100% Whey", "۱۰۰")).toBe(true);
    expect(matchesQuery("ویتامین د۳", "د3")).toBe(true);
  });

  it("returns false when the text doesn't contain the query", () => {
    expect(matchesQuery("Gold Standard", "casein")).toBe(false);
  });
});

describe("normalizeSearchText", () => {
  it("keeps the text's length, so match positions stay valid", () => {
    const text = "سی‌فور ۴ كراتين ABC";
    expect(normalizeSearchText(text)).toHaveLength(text.length);
  });
});

describe("findMatch", () => {
  it("gives the match's position in the original text", () => {
    expect(findMatch("Gold Standard Whey", "WHEY")).toBe(14);
    expect(findMatch("سی‌فور", "فور")).toBe(3);
    expect(findMatch("Gold Standard Whey", "casein")).toBe(-1);
  });
});

describe("searchPattern", () => {
  // The pattern goes to MongoDB with the "i" option; a JS RegExp reads these
  // classes the same way.
  const find = (name: string, query: string) => new RegExp(searchPattern(query), "i").test(name);

  it("finds names however the query was typed", () => {
    expect(find("Gold Standard 100% Whey", "whey")).toBe(true);
    expect(find("سی‌فور اورجینال", "سی فور")).toBe(true);
    expect(find("سی فور اورجینال", "سی‌فور")).toBe(true);
    expect(find("کراتین مونوهیدرات", "كراتين")).toBe(true);
    expect(find("Gold Standard 100% Whey", "۱۰۰")).toBe(true);
    expect(find("ویتامین د۳", "د3")).toBe(true);
    expect(find("پیش تمرین", "  پیش   تمرین ")).toBe(true);
  });

  it("matches regex characters literally", () => {
    expect(find("Gold Standard 100% Whey", "100%")).toBe(true);
    expect(find("N.O.-Xplode", "n.o.")).toBe(true);
    expect(find("NOX-Xplode", "n.o.")).toBe(false);
    expect(() => new RegExp(searchPattern("(a+)+$["))).not.toThrow();
  });
});
