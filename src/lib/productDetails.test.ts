import { describe, expect, it } from "vitest";
import {
  formatNutritionFacts,
  parseNutritionFacts,
  productDetailsSchema,
  withoutEmptyDetails,
} from "./productDetails";

describe("parseNutritionFacts", () => {
  it("reads one label: amount per line and trims both sides", () => {
    expect(parseNutritionFacts("  پروتئین :  ۲۵ گرم \nکالری: ۱۲۰")).toEqual({
      facts: [
        { label: "پروتئین", amount: "۲۵ گرم" },
        { label: "کالری", amount: "۱۲۰" },
      ],
      invalidLines: [],
    });
  });

  it("skips blank lines", () => {
    expect(parseNutritionFacts("\n\nقند: ۱ گرم\n   \n").facts).toHaveLength(1);
  });

  it("splits on the first colon only, so amounts may contain one", () => {
    expect(parseNutritionFacts("نسبت: ۲:۱:۱").facts).toEqual([{ label: "نسبت", amount: "۲:۱:۱" }]);
  });

  it("reports lines without a colon or with an empty side", () => {
    expect(parseNutritionFacts("بدون دونقطه\n: ۵ گرم\nچربی:").invalidLines).toEqual([
      "بدون دونقطه",
      ": ۵ گرم",
      "چربی:",
    ]);
  });
});

describe("formatNutritionFacts", () => {
  it("round-trips with parseNutritionFacts", () => {
    const facts = [
      { label: "پروتئین", amount: "۲۵ گرم" },
      { label: "BCAA", amount: "۵٫۵ گرم" },
    ];
    expect(parseNutritionFacts(formatNutritionFacts(facts)).facts).toEqual(facts);
  });
});

describe("productDetailsSchema", () => {
  it("accepts valid details and drops unknown keys", () => {
    const result = productDetailsSchema.safeParse({
      servingSize: " ۱ اسکوپ ",
      nutritionFacts: [{ label: "پروتئین", amount: "۲۵ گرم" }],
      price: 1,
    });
    expect(result.success && result.data).toEqual({
      servingSize: "۱ اسکوپ",
      nutritionFacts: [{ label: "پروتئین", amount: "۲۵ گرم" }],
    });
  });

  it("rejects a nutrition fact with an empty amount", () => {
    expect(
      productDetailsSchema.safeParse({ nutritionFacts: [{ label: "پروتئین", amount: " " }] }).success
    ).toBe(false);
  });

  it("rejects non-string text fields", () => {
    expect(productDetailsSchema.safeParse({ usage: { $ne: null } }).success).toBe(false);
  });
});

describe("withoutEmptyDetails", () => {
  it("turns cleared fields into undefined", () => {
    expect(withoutEmptyDetails({ servingSize: "", nutritionFacts: [], usage: "", warnings: "x" })).toEqual({
      servingSize: undefined,
      nutritionFacts: undefined,
      usage: undefined,
      warnings: "x",
    });
  });

  it("leaves out keys that weren't sent", () => {
    expect(withoutEmptyDetails({ usage: "" })).toEqual({ usage: undefined });
    expect(Object.keys(withoutEmptyDetails({ usage: "" }))).toEqual(["usage"]);
  });
});
