import { describe, expect, it } from "vitest";
import { DEFAULT_SHARE_IMAGE, pageMetadata, paginatedPath, toMetaDescription } from "./seo";

describe("paginatedPath", () => {
  it("is the bare path for page 1, a missing page or nonsense", () => {
    for (const page of [undefined, "1", "0", "-3", "abc", "2.5", ""]) {
      expect(paginatedPath("/products", page)).toBe("/products");
    }
  });

  it("keeps ?page=N from page 2 on, each page being its own list", () => {
    expect(paginatedPath("/products", "2")).toBe("/products?page=2");
    expect(paginatedPath("/reviews", ["3", "9"])).toBe("/reviews?page=3");
  });
});

describe("toMetaDescription", () => {
  it("keeps a short text, with its whitespace collapsed", () => {
    expect(toMetaDescription("  پروتئین وی\n\nبا طعم   شکلات ")).toBe("پروتئین وی با طعم شکلات");
  });

  it("cuts a long text at a word boundary, within 160 characters, with an ellipsis", () => {
    const text = "کلمه ".repeat(60);
    const result = toMetaDescription(text);
    expect(result.length).toBeLessThanOrEqual(160);
    expect(result.endsWith("کلمه…")).toBe(true);
  });

  it("drops punctuation left at the cut", () => {
    // 39 × 4 characters, then "ب،": the last space within the limit follows the comma.
    const text = `${"الف ".repeat(39)}ب، ${"ج ".repeat(40)}`;
    expect(toMetaDescription(text)).toMatch(/ب…$/);
  });
});

describe("pageMetadata", () => {
  const product = {
    title: "وی گلد استاندارد",
    description: "پودر پروتئین",
    path: "/products/on1",
    image: "/images/products/on1.webp",
  };

  it("gives the page its own title, description, url and image in link previews", () => {
    const metadata = pageMetadata(product);
    expect(metadata.openGraph).toMatchObject({
      title: "وی گلد استاندارد",
      description: "پودر پروتئین",
      url: "/products/on1",
      images: ["/images/products/on1.webp"],
      siteName: "SK Supplement",
      locale: "fa_IR",
    });
    expect(metadata.twitter).toMatchObject({ images: ["/images/products/on1.webp"] });
  });

  it("sets the canonical url to the path, so query strings count as the same page", () => {
    expect(pageMetadata(product).alternates).toEqual({ canonical: "/products/on1" });
  });

  it("falls back to the site banner without an image", () => {
    const { image, ...withoutImage } = product;
    void image;
    expect(pageMetadata(withoutImage).openGraph).toMatchObject({ images: [DEFAULT_SHARE_IMAGE] });
  });

  it("is a website by default", () => {
    expect(pageMetadata(product).openGraph).toMatchObject({ type: "website" });
  });

  it("shares a blog post as an article, with its date and author", () => {
    const metadata = pageMetadata({
      ...product,
      path: "/blogs/creatine",
      article: { publishedAt: new Date("2026-10-01T08:00:00Z"), author: "تیم SK" },
    });
    expect(metadata.openGraph).toMatchObject({
      type: "article",
      publishedTime: "2026-10-01T08:00:00.000Z",
      authors: ["تیم SK"],
      siteName: "SK Supplement",
      url: "/blogs/creatine",
    });
  });
});
