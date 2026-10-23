import { describe, expect, it } from "vitest";
import { buildNavSections } from "./navigation";

describe("buildNavSections", () => {
  const [categories, brands] = buildNavSections(
    [{ slug: "protein", title: "پروتئین" }],
    ["BSN", "Optimum Nutrition"]
  );

  it("links each category to its collection page", () => {
    expect(categories.links).toEqual([{ href: "/collections/protein", label: "پروتئین" }]);
  });

  it("links each brand by its Persian name, in Persian alphabetical order", () => {
    expect(brands.links).toEqual([
      { href: "/products?brand=Optimum%20Nutrition", label: "اپتیموم نوتریشن" },
      { href: "/products?brand=BSN", label: "بی‌اس‌ان" },
    ]);
  });

  it("encodes characters that aren't safe in a query string", () => {
    const [brandSection] = buildNavSections([], ["M&S"]);
    expect(brandSection.links[0].href).toBe("/products?brand=M%26S");
  });

  it("leaves out a section that has no links", () => {
    expect(buildNavSections([], ["Optimum Nutrition"]).map((section) => section.id)).toEqual([
      "brands",
    ]);
  });
});
