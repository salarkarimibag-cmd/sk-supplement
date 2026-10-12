import { afterEach, describe, expect, it } from "vitest";
import { cardTransferSchema, formatCardNumber, getShopCard, toEnglishDigits } from "./cardPayment";

describe("toEnglishDigits", () => {
  it("converts Persian and Arabic-Indic digits and leaves everything else alone", () => {
    expect(toEnglishDigits("۱۲۳۴")).toBe("1234");
    expect(toEnglishDigits("٠١٢٣٤٥٦٧٨٩")).toBe("0123456789");
    expect(toEnglishDigits("کد ۰۹۸ abc 7")).toBe("کد 098 abc 7");
  });
});

describe("formatCardNumber", () => {
  it("groups a 16-digit card number in fours", () => {
    expect(formatCardNumber("6037991234567890")).toBe("6037 9912 3456 7890");
  });
});

describe("cardTransferSchema", () => {
  it("accepts Persian digits and spaces, normalizing them", () => {
    expect(cardTransferSchema.parse({ trackingCode: "۱۲۳ ۴۵۶", cardLast4: "۹۸۷۶" })).toEqual({
      trackingCode: "123456",
      cardLast4: "9876",
    });
  });

  it("rejects a last-4 that isn't exactly four digits", () => {
    expect(cardTransferSchema.safeParse({ trackingCode: "123456", cardLast4: "123" }).success).toBe(false);
    expect(cardTransferSchema.safeParse({ trackingCode: "123456", cardLast4: "12a4" }).success).toBe(false);
  });

  it("rejects a tracking code that is too short or has symbols", () => {
    expect(cardTransferSchema.safeParse({ trackingCode: "12", cardLast4: "1234" }).success).toBe(false);
    expect(cardTransferSchema.safeParse({ trackingCode: "12$45", cardLast4: "1234" }).success).toBe(false);
  });
});

describe("getShopCard", () => {
  const original = { ...process.env };
  afterEach(() => {
    process.env = { ...original };
  });

  it("returns null when the card isn't configured", () => {
    delete process.env.CARD_NUMBER;
    delete process.env.CARD_HOLDER;
    expect(getShopCard()).toBeNull();
  });

  it("reads and cleans the configured card", () => {
    process.env.CARD_NUMBER = "6037-9912-3456-7890";
    process.env.CARD_HOLDER = " Salar ";
    delete process.env.CARD_BANK;
    expect(getShopCard()).toEqual({ number: "6037991234567890", holder: "Salar", bank: undefined });
  });

  it("rejects a card number that isn't 16 digits", () => {
    process.env.CARD_NUMBER = "1234";
    process.env.CARD_HOLDER = "Salar";
    expect(getShopCard()).toBeNull();
  });
});
