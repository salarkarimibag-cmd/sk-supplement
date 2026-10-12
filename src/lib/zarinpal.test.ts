import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

// zarinpal.ts reads the merchant id when it loads, so it's set before the import.
process.env.ZARINPAL_MERCHANT_ID = "test-merchant";
const { requestZarinPalPayment, verifyZarinPalPayment } = await import("./zarinpal");

// A stand-in for the global fetch, so no request ever leaves the machine.
const fetchMock = vi.fn();
beforeAll(() => vi.stubGlobal("fetch", fetchMock));
afterEach(() => fetchMock.mockReset());

function jsonResponse(body: unknown) {
  return { json: async () => body };
}

const requestParams = { amountToman: 1000, description: "test", callbackUrl: "http://x/callback" };
const verifyParams = { amountToman: 1000, authority: "A1" };

describe("requestZarinPalPayment", () => {
  it("returns the payment url when ZarinPal accepts the request", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ data: { code: 100, authority: "A1" } }));
    await expect(requestZarinPalPayment(requestParams)).resolves.toEqual({
      ok: true,
      authority: "A1",
      paymentUrl: expect.stringContaining("/pg/StartPay/A1"),
    });
  });

  it("reports the gateway as unreachable on a network error instead of throwing", async () => {
    fetchMock.mockRejectedValue(new TypeError("fetch failed"));
    const result = await requestZarinPalPayment(requestParams);
    expect(result.ok).toBe(false);
    expect(!result.ok && result.message).toContain("ارتباط با درگاه زرین‌پال برقرار نشد");
  });

  it("treats a non-JSON answer (e.g. an HTML error page) as unreachable", async () => {
    fetchMock.mockResolvedValue({ json: async () => JSON.parse("<html>") });
    const result = await requestZarinPalPayment(requestParams);
    expect(!result.ok && result.message).toContain("ارتباط با درگاه زرین‌پال برقرار نشد");
  });
});

describe("verifyZarinPalPayment", () => {
  it("verifies a paid order", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ data: { code: 100, ref_id: 42 } }));
    await expect(verifyZarinPalPayment(verifyParams)).resolves.toEqual({ ok: true, refId: 42 });
  });

  it("marks a network failure as retryable, so the order isn't failed", async () => {
    fetchMock.mockRejectedValue(new TypeError("fetch failed"));
    const result = await verifyZarinPalPayment(verifyParams);
    expect(result).toMatchObject({ ok: false, retryable: true });
  });

  it("marks ZarinPal's own rejection as final", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ data: {}, errors: { message: "Session is not valid" } }));
    const result = await verifyZarinPalPayment(verifyParams);
    expect(result).toEqual({ ok: false, retryable: false, message: "Session is not valid" });
  });
});
