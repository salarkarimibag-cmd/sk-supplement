import { describe, expect, it } from "vitest";
import { findMatch, matchesQuery } from "./searchText";

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

  it("returns false when the text doesn't contain the query", () => {
    expect(matchesQuery("Gold Standard", "casein")).toBe(false);
  });
});

describe("findMatch", () => {
  it("gives the match's position in the original text", () => {
    expect(findMatch("Gold Standard Whey", "WHEY")).toBe(14);
    expect(findMatch("Gold Standard Whey", "casein")).toBe(-1);
  });
});
