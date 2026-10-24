import { describe, expect, it } from "vitest";
import {
  CONTACT_MESSAGE_MAX_LENGTH,
  CONTACT_NAME_MAX_LENGTH,
  contactMessageSchema,
  newsletterSchema,
} from "./publicForms";

const validMessage = { name: "علی", email: "ali@example.com", message: "سلام" };

describe("contactMessageSchema", () => {
  it("accepts a valid message and trims it, lowercasing the email", () => {
    const result = contactMessageSchema.safeParse({
      name: "  علی ",
      email: " Ali@Example.COM ",
      message: " سلام ",
    });
    expect(result.success && result.data).toEqual(validMessage);
  });

  it("rejects non-string fields instead of throwing", () => {
    expect(contactMessageSchema.safeParse({ ...validMessage, name: 123 }).success).toBe(false);
    expect(contactMessageSchema.safeParse({ ...validMessage, email: { $ne: null } }).success).toBe(
      false
    );
    expect(contactMessageSchema.safeParse(null).success).toBe(false);
  });

  it("rejects empty or whitespace-only fields", () => {
    expect(contactMessageSchema.safeParse({ ...validMessage, name: "   " }).success).toBe(false);
    expect(contactMessageSchema.safeParse({ ...validMessage, message: "" }).success).toBe(false);
  });

  it("rejects an invalid email", () => {
    expect(contactMessageSchema.safeParse({ ...validMessage, email: "ali@" }).success).toBe(false);
  });

  it("rejects a name or message over the length limit", () => {
    const longName = "ا".repeat(CONTACT_NAME_MAX_LENGTH + 1);
    const longMessage = "ا".repeat(CONTACT_MESSAGE_MAX_LENGTH + 1);
    expect(contactMessageSchema.safeParse({ ...validMessage, name: longName }).success).toBe(false);
    expect(contactMessageSchema.safeParse({ ...validMessage, message: longMessage }).success).toBe(
      false
    );
  });
});

describe("newsletterSchema", () => {
  it("accepts an email and normalizes it", () => {
    const result = newsletterSchema.safeParse({ email: " Ali@Example.com " });
    expect(result.success && result.data).toEqual({ email: "ali@example.com" });
  });

  it("rejects a missing, non-string or invalid email", () => {
    expect(newsletterSchema.safeParse({}).success).toBe(false);
    expect(newsletterSchema.safeParse({ email: 42 }).success).toBe(false);
    expect(newsletterSchema.safeParse({ email: "not-an-email" }).success).toBe(false);
    expect(newsletterSchema.safeParse({ email: `${"a".repeat(250)}@x.com` }).success).toBe(false);
  });
});
