import { describe, expect, it } from "vitest";
import { containsBannedWord, normalizeForMatching } from "./bannedWords";

describe("normalizeForMatching", () => {
  it("maps Arabic letters to Persian and drops half-spaces and diacritics", () => {
    expect(normalizeForMatching("كيك")).toBe("کیک");
    expect(normalizeForMatching("کس‌کش")).toBe("کسکش");
    expect(normalizeForMatching("گُه")).toBe("گه");
    expect(normalizeForMatching("تـخـمـی")).toBe("تخمی");
  });
});

describe("containsBannedWord", () => {
  it("catches the review that had to be deleted by hand", () => {
    expect(containsBannedWord("خیلی  همه چی  تخمی بود")).toBe(true);
  });

  it("catches a banned word next to punctuation", () => {
    expect(containsBannedWord("محصولش گه بود!")).toBe(true);
    expect(containsBannedWord("«تخمی»")).toBe(true);
  });

  it("catches other spellings of the same word", () => {
    expect(containsBannedWord("کس‌کش")).toBe(true);
    expect(containsBannedWord("تـخـمـی")).toBe(true);
  });

  it("does not flag innocent words that merely contain a banned one", () => {
    expect(containsBannedWord("هیچ‌کس این طعم را دوست ندارد")).toBe(false);
    expect(containsBannedWord("برای کسب‌وکار خوب است")).toBe(false);
    expect(containsBannedWord("تخم مرغ و پروتئین وی")).toBe(false);
    expect(containsBannedWord("کیفیت عالی، کونترل وزن راحت‌تر شد")).toBe(false);
    expect(containsBannedWord("گهگاهی مصرف می‌کنم")).toBe(false);
  });

  it("passes ordinary reviews", () => {
    expect(containsBannedWord("کیفیت محصول خوب بود، فقط کاش تنوع طعم‌ها بیشتر می‌شد.")).toBe(false);
    expect(containsBannedWord("")).toBe(false);
  });
});
