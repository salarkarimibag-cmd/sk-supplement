import { describe, expect, it } from "vitest";
import { buildSitemapEntries, lastModifiedOf, latestDate } from "./sitemapEntries";

// An object shaped like a MongoDB ObjectId, whose creation time is known.
function idCreatedAt(iso: string) {
  return { getTimestamp: () => new Date(iso) };
}

describe("lastModifiedOf", () => {
  it("prefers updatedAt", () => {
    const doc = { updatedAt: new Date("2026-03-01"), _id: idCreatedAt("2026-01-01") };
    expect(lastModifiedOf(doc)).toEqual(new Date("2026-03-01"));
  });

  it("falls back to the creation time in the _id", () => {
    expect(lastModifiedOf({ _id: idCreatedAt("2026-01-01") })).toEqual(new Date("2026-01-01"));
  });

  it("accepts updatedAt as an ISO string", () => {
    expect(lastModifiedOf({ updatedAt: "2026-03-01T10:00:00.000Z" })).toEqual(
      new Date("2026-03-01T10:00:00.000Z")
    );
  });

  it("is undefined when the document says nothing about time", () => {
    expect(lastModifiedOf({})).toBeUndefined();
  });
});

describe("latestDate", () => {
  it("returns the most recent date and skips missing ones", () => {
    expect(
      latestDate([new Date("2026-01-01"), undefined, new Date("2026-05-01"), new Date("2026-03-01")])
    ).toEqual(new Date("2026-05-01"));
  });

  it("is undefined for no dates at all", () => {
    expect(latestDate([])).toBeUndefined();
    expect(latestDate([undefined])).toBeUndefined();
  });
});

describe("buildSitemapEntries", () => {
  const entries = buildSitemapEntries({
    siteUrl: "https://example.com",
    products: [
      { id: "p1", categorySlug: "protein", _id: idCreatedAt("2026-01-10") },
      {
        id: "p2",
        categorySlug: "protein",
        _id: idCreatedAt("2026-01-20"),
        updatedAt: new Date("2026-04-01"),
      },
      { id: "p3", categorySlug: "vitamins", _id: idCreatedAt("2026-02-01") },
    ],
    categories: [{ slug: "protein" }, { slug: "vitamins" }, { slug: "empty" }],
    posts: [
      { slug: "old", publishedAt: new Date("2026-02-15") },
      { slug: "new", publishedAt: new Date("2026-03-15") },
    ],
  });
  const byUrl = (path: string) => entries.find((entry) => entry.url === `https://example.com${path}`);

  it("dates each product by its own last change", () => {
    expect(byUrl("/products/p1")?.lastModified).toEqual(new Date("2026-01-10"));
    expect(byUrl("/products/p2")?.lastModified).toEqual(new Date("2026-04-01"));
  });

  it("dates posts by when they were published", () => {
    expect(byUrl("/blogs/old")?.lastModified).toEqual(new Date("2026-02-15"));
  });

  it("dates a category by its newest product", () => {
    expect(byUrl("/collections/protein")?.lastModified).toEqual(new Date("2026-04-01"));
    expect(byUrl("/collections/vitamins")?.lastModified).toEqual(new Date("2026-02-01"));
  });

  it("gives a category with no products no date", () => {
    expect(byUrl("/collections/empty")).toBeDefined();
    expect(byUrl("/collections/empty")?.lastModified).toBeUndefined();
  });

  it("dates the blog index and the home page by what they list", () => {
    expect(byUrl("/blogs")?.lastModified).toEqual(new Date("2026-03-15"));
    expect(entries[0].url).toBe("https://example.com");
    expect(entries[0].lastModified).toEqual(new Date("2026-04-01"));
  });

  it("leaves static pages undated instead of claiming they just changed", () => {
    for (const path of ["/pages/faq", "/pages/refund-policy", "/pages/authenticity-guarantee"]) {
      expect(byUrl(path)).toBeDefined();
      expect(byUrl(path)).not.toHaveProperty("lastModified");
    }
  });

  it("never dates anything as 'now'", () => {
    const now = Date.now();
    for (const entry of entries) {
      if (entry.lastModified) expect(new Date(entry.lastModified).getTime()).toBeLessThan(now - 1000 * 60 * 60 * 24);
    }
  });
});
