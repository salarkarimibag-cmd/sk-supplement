import { describe, expect, it } from "vitest";
import { buildNavSections } from "./navigation";

describe("buildNavSections", () => {
  const [categories, brands] = buildNavSections(
    [{ slug: "protein", title: "پروتئین" }],
    ["Optimum Nutrition", "M&S"]
  );

  it("links each category to its collection page", () => {
    expect(categories.links).toEqual([{ href: "/collections/protein", label: "پروتئین" }]);
  });

  it("links each brand to the products page filtered by that brand", () => {
    expect(brands.links).toEqual([
      { href: "/products?brand=Optimum%20Nutrition", label: "Optimum Nutrition" },
      { href: "/products?brand=M%26S", label: "M&S" },
    ]);
  });

  it("leaves out a section that has no links", () => {
    expect(buildNavSections([], ["Optimum Nutrition"]).map((section) => section.id)).toEqual([
      "brands",
    ]);
  });
});
