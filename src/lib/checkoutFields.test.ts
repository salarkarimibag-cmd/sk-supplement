import { describe, expect, it } from "vitest";
import {
  contactSchema,
  normalizeMobile,
  normalizePostalCode,
  shippingAddressSchema,
} from "./checkoutFields";

const address = {
  firstName: "علی",
  lastName: "رضایی",
  province: "تهران",
  city: "تهران",
  address: "خیابان آزادی، پلاک ۱",
  postalCode: "1234567890",
};

describe("normalizeMobile", () => {
  it("brings the usual ways of writing a mobile number to 09xxxxxxxxx", () => {
    expect(normalizeMobile("09123456789")).toBe("09123456789");
    expect(normalizeMobile("۰۹۱۲ ۳۴۵ ۶۷۸۹")).toBe("09123456789");
    expect(normalizeMobile("+98 912 345 6789")).toBe("09123456789");
    expect(normalizeMobile("00989123456789")).toBe("09123456789");
    expect(normalizeMobile("989123456789")).toBe("09123456789");
    expect(normalizeMobile("9123456789")).toBe("09123456789");
    expect(normalizeMobile("0912-345-6789")).toBe("09123456789");
  });
});

describe("normalizePostalCode", () => {
  it("converts Persian digits and removes spaces and dashes", () => {
    expect(normalizePostalCode("۱۲۳۴۵-۶۷۸۹۰")).toBe("1234567890");
    expect(normalizePostalCode(" 12345 67890 ")).toBe("1234567890");
  });
});

describe("contactSchema", () => {
  it("normalizes the email and the mobile number", () => {
    expect(
      contactSchema.parse({ email: " Buyer@Example.com ", mobile: "۰۹۱۲۳۴۵۶۷۸۹" })
    ).toEqual({ email: "buyer@example.com", mobile: "09123456789" });
  });

  it("rejects anything that isn't an Iranian mobile number", () => {
    for (const mobile of ["abcdefghij", "0912345678", "021-12345678", "08123456789", ""]) {
      expect(contactSchema.safeParse({ email: "a@b.co", mobile }).success).toBe(false);
    }
  });

  it("rejects a non-string value instead of crashing", () => {
    expect(contactSchema.safeParse({ email: { $ne: null }, mobile: 9123456789 }).success).toBe(
      false
    );
  });
});

describe("shippingAddressSchema", () => {
  it("accepts a full address and normalizes the postal code", () => {
    expect(shippingAddressSchema.parse({ ...address, postalCode: "۱۲۳۴۵-۶۷۸۹۰" })).toEqual(address);
  });

  it("rejects a postal code that isn't 10 digits", () => {
    for (const postalCode of ["123456789", "12345678901", "12345abcde", ""]) {
      expect(shippingAddressSchema.safeParse({ ...address, postalCode }).success).toBe(false);
    }
  });

  it("rejects blank or overlong fields", () => {
    expect(shippingAddressSchema.safeParse({ ...address, city: "   " }).success).toBe(false);
    expect(shippingAddressSchema.safeParse({ ...address, address: "x".repeat(501) }).success).toBe(
      false
    );
  });
});
