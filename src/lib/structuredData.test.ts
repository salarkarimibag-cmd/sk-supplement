import { describe, expect, it } from "vitest";
import { buildBreadcrumbJsonLd, buildProductJsonLd, serializeJsonLd } from "./structuredData";

const siteUrl = "https://example.com";
const product = {
  id: "p1",
  name: "وی پروتئین",
  description: "پروتئین با کیفیت",
  price: 1_250_000,
  imageUrl: "/images/whey.webp",
  inStock: true,
  rating: 4.5,
  reviewCount: 12,
};

describe("buildProductJsonLd", () => {
  it("describes the product with absolute urls", () => {
    const jsonLd = buildProductJsonLd(product, siteUrl);
    expect(jsonLd["@type"]).toBe("Product");
    expect(jsonLd.url).toBe("https://example.com/products/p1");
    expect(jsonLd.image).toBe("https://example.com/images/whey.webp");
    expect(jsonLd.description).toBe("پروتئین با کیفیت");
  });

  it("keeps an image url that is already absolute", () => {
    const jsonLd = buildProductJsonLd({ ...product, imageUrl: "https://cdn.example/a.png" }, siteUrl);
    expect(jsonLd.image).toBe("https://cdn.example/a.png");
  });

  it("names the brand when the product has one", () => {
    const jsonLd = buildProductJsonLd({ ...product, brand: "برند الف" }, siteUrl);
    expect(jsonLd.brand).toEqual({ "@type": "Brand", name: "برند الف" });
  });

  it("leaves the brand out when the product has none", () => {
    expect(buildProductJsonLd(product, siteUrl)).not.toHaveProperty("brand");
  });

  it("converts the Toman price to Rial (IRR)", () => {
    const { offers } = buildProductJsonLd(product, siteUrl);
    expect(offers.price).toBe(12_500_000);
    expect(offers.priceCurrency).toBe("IRR");
  });

  it("reports stock", () => {
    expect(buildProductJsonLd(product, siteUrl).offers.availability).toBe(
      "https://schema.org/InStock"
    );
    expect(buildProductJsonLd({ ...product, inStock: false }, siteUrl).offers.availability).toBe(
      "https://schema.org/OutOfStock"
    );
  });

  it("advertises free same-day-dispatch shipping within Iran", () => {
    const { shippingDetails } = buildProductJsonLd(product, siteUrl).offers;
    expect(shippingDetails.shippingRate.value).toBe(0);
    expect(shippingDetails.shippingDestination.addressCountry).toBe("IR");
    expect(shippingDetails.deliveryTime.handlingTime).toMatchObject({ minValue: 0, maxValue: 0 });
    expect(shippingDetails.deliveryTime.transitTime).toMatchObject({ minValue: 2, maxValue: 7 });
    expect(shippingDetails.deliveryTime.businessDays.dayOfWeek).not.toContain(
      "https://schema.org/Friday"
    );
  });

  it("includes the rating only when there are reviews", () => {
    expect(buildProductJsonLd(product, siteUrl).aggregateRating).toMatchObject({
      ratingValue: 4.5,
      reviewCount: 12,
    });
    expect(
      buildProductJsonLd({ ...product, rating: 0, reviewCount: 0 }, siteUrl)
    ).not.toHaveProperty("aggregateRating");
  });

  it("leaves out an empty description", () => {
    expect(buildProductJsonLd({ ...product, description: "" }, siteUrl)).not.toHaveProperty(
      "description"
    );
  });
});

describe("buildBreadcrumbJsonLd", () => {
  it("numbers the items from 1 with absolute urls", () => {
    const jsonLd = buildBreadcrumbJsonLd(
      [
        { name: "خانه", path: "/" },
        { name: "پروتئین", path: "/collections/protein" },
      ],
      siteUrl
    );
    expect(jsonLd.itemListElement).toEqual([
      { "@type": "ListItem", position: 1, name: "خانه", item: "https://example.com/" },
      {
        "@type": "ListItem",
        position: 2,
        name: "پروتئین",
        item: "https://example.com/collections/protein",
      },
    ]);
  });
});

describe("serializeJsonLd", () => {
  it("can't be used to close the script tag early", () => {
    const json = serializeJsonLd({ name: "</script><script>alert(1)</script>" });
    expect(json).not.toContain("<");
    expect(JSON.parse(json).name).toBe("</script><script>alert(1)</script>");
  });
});
