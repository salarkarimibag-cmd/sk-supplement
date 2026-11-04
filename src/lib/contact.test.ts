import { describe, expect, it } from "vitest";
import { CONTACT_PHONE, toInternationalPhone, toPersianDigits } from "./contact";

describe("toInternationalPhone", () => {
  it("swaps the leading zero for Iran's country code", () => {
    expect(toInternationalPhone("09121234567")).toBe("+989121234567");
  });

  it("gives the shop's phone in the form tel: links need", () => {
    expect(toInternationalPhone(CONTACT_PHONE)).toMatch(/^\+989\d{9}$/);
  });
});

describe("toPersianDigits", () => {
  it("keeps the leading zero", () => {
    expect(toPersianDigits("0912")).toBe("۰۹۱۲");
  });

  it("leaves other characters alone", () => {
    expect(toPersianDigits("کوچه 7")).toBe("کوچه ۷");
  });
});
