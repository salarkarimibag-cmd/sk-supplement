import { describe, expect, it } from "vitest";
import { FREE_SHIPPING_MIN, SHIPPING_FEE } from "./shipping";
import {
  buildBreadcrumbJsonLd,
  buildProductJsonLd,
  buildStoreJsonLd,
  buildWebSiteJsonLd,
  serializeJsonLd,
} from "./structuredData";

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

function offersOf(p: typeof product) {
  const { offers } = buildProductJsonLd(p, siteUrl);
  if (!offers) throw new Error("expected an offer");
  return offers;
}

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
    const offers = offersOf(product);
    expect(offers.price).toBe(12_500_000);
    expect(offers.priceCurrency).toBe("IRR");
  });

  it("reports stock", () => {
    expect(offersOf(product).availability).toBe("https://schema.org/InStock");
    expect(offersOf({ ...product, inStock: false }).availability).toBe(
      "https://schema.org/OutOfStock"
    );
  });

  it("leaves out the offer when asked to", () => {
    expect(buildProductJsonLd(product, siteUrl, { includeOffer: false })).not.toHaveProperty(
      "offers"
    );
  });

  it("advertises same-day-dispatch shipping within Iran", () => {
    const { shippingDetails } = offersOf(product);
    expect(shippingDetails.shippingDestination.addressCountry).toBe("IR");
    expect(shippingDetails.deliveryTime.handlingTime).toMatchObject({ minValue: 0, maxValue: 0 });
    expect(shippingDetails.deliveryTime.transitTime).toMatchObject({ minValue: 2, maxValue: 7 });
    expect(shippingDetails.deliveryTime.businessDays.dayOfWeek).not.toContain(
      "https://schema.org/Friday"
    );
  });

  it("gives the shipping rate for buying that one product, in Rial", () => {
    const rateOf = (price: number) =>
      offersOf({ ...product, price }).shippingDetails.shippingRate.value;
    expect(rateOf(FREE_SHIPPING_MIN - 1)).toBe(SHIPPING_FEE * 10);
    expect(rateOf(FREE_SHIPPING_MIN)).toBe(0);
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

describe("buildStoreJsonLd", () => {
  it("names the shop, with absolute urls", () => {
    expect(buildStoreJsonLd(siteUrl)).toMatchObject({
      "@context": "https://schema.org",
      "@type": "OnlineStore",
      name: "SK Supplement",
      url: "https://example.com/",
      logo: "https://example.com/images/logo.webp",
    });
  });

  it("gives the contact details with an international phone number", () => {
    const store = buildStoreJsonLd(siteUrl);
    expect(store.email).toBe("info@sksupplement.shop");
    expect(store.telephone).toMatch(/^\+98/);
    expect(store.address).toMatchObject({ "@type": "PostalAddress", addressCountry: "IR" });
  });
});

describe("buildWebSiteJsonLd", () => {
  it("gives the site's name and home page", () => {
    expect(buildWebSiteJsonLd(siteUrl)).toEqual({
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "SK Supplement",
      url: "https://example.com/",
    });
  });
});

describe("serializeJsonLd", () => {
  it("can't be used to close the script tag early", () => {
    const json = serializeJsonLd({ name: "</script><script>alert(1)</script>" });
    expect(json).not.toContain("<");
    expect(JSON.parse(json).name).toBe("</script><script>alert(1)</script>");
  });
});
