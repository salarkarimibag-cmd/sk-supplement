import { describe, expect, it } from "vitest";
import {
  buildPasswordResetEmail,
  buildResetUrl,
  createResetToken,
  hashResetToken,
  isResetTokenFormat,
  isSessionStale,
  resetPasswordSchema,
} from "./passwordReset";

describe("createResetToken", () => {
  it("returns a 64-char hex token and its hash", () => {
    const { token, tokenHash } = createResetToken();
    expect(isResetTokenFormat(token)).toBe(true);
    expect(tokenHash).toBe(hashResetToken(token));
    expect(tokenHash).not.toBe(token);
  });

  it("returns a different token every time", () => {
    expect(createResetToken().token).not.toBe(createResetToken().token);
  });
});

describe("isResetTokenFormat", () => {
  it("rejects anything that isn't 64 lowercase hex chars", () => {
    expect(isResetTokenFormat("abc")).toBe(false);
    expect(isResetTokenFormat("Z".repeat(64))).toBe(false);
    expect(isResetTokenFormat(undefined)).toBe(false);
    expect(isResetTokenFormat(["a".repeat(64)])).toBe(false);
  });
});

describe("resetPasswordSchema", () => {
  const token = "a".repeat(64);

  it("accepts a valid token and password", () => {
    expect(resetPasswordSchema.safeParse({ token, password: "12345678" }).success).toBe(true);
  });

  it("rejects short and too-long passwords", () => {
    expect(resetPasswordSchema.safeParse({ token, password: "1234567" }).success).toBe(false);
    expect(resetPasswordSchema.safeParse({ token, password: "x".repeat(73) }).success).toBe(false);
  });

  it("rejects a non-string token such as a MongoDB operator", () => {
    expect(resetPasswordSchema.safeParse({ token: { $ne: null }, password: "12345678" }).success).toBe(
      false
    );
  });
});

describe("buildResetUrl / buildPasswordResetEmail", () => {
  it("puts the link in both the text and html bodies", () => {
    const url = buildResetUrl("https://example.com", "a".repeat(64));
    expect(url).toBe(`https://example.com/account/reset-password?token=${"a".repeat(64)}`);

    const email = buildPasswordResetEmail(url);
    expect(email.text).toContain(url);
    expect(email.html).toContain(`href="${url}"`);
  });
});

describe("isSessionStale", () => {
  const changedAt = new Date("2026-01-01T00:00:10.500Z");
  const changedAtSeconds = Math.floor(changedAt.getTime() / 1000);

  it("never treats a session as stale if the password was never changed", () => {
    expect(isSessionStale(0, undefined)).toBe(false);
  });

  it("treats sessions issued before the change as stale", () => {
    expect(isSessionStale(changedAtSeconds - 1, changedAt)).toBe(true);
  });

  it("keeps a session issued in the same second as the change", () => {
    expect(isSessionStale(changedAtSeconds, changedAt)).toBe(false);
  });

  it("keeps sessions issued after the change and accepts ISO strings", () => {
    expect(isSessionStale(changedAtSeconds + 5, changedAt.toISOString())).toBe(false);
  });

  it("treats a token without iat as stale once the password has changed", () => {
    expect(isSessionStale(undefined, changedAt)).toBe(true);
  });
});
