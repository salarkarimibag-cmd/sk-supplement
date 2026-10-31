import { describe, expect, it } from "vitest";
import {
  buildAdminOrderEmail,
  buildOrderEmail,
  emailKindForAdminStatus,
  formatOrderNumber,
  formatProductName,
  type AdminOrderEmailInput,
  type OrderEmailInput,
} from "./orderEmail";

const baseInput: OrderEmailInput = {
  kind: "paid",
  orderId: "6ad20bba9ed7860dcd1b9185",
  firstName: "علی",
  lastName: "رضایی",
  lines: [
    { name: "وی پروتئین", quantity: 2, unitPrice: 1_000_000 },
    { name: "کراتین", quantity: 1, unitPrice: 500_000 },
  ],
  totalPrice: 2_300_000,
  discountAmount: 200_000,
  paymentMethod: "zarinpal",
  refId: 987654,
  address: { province: "تهران", city: "تهران", address: "خیابان آزادی", postalCode: "1234567890" },
  siteUrl: "https://example.com",
  hasAccount: true,
};

describe("formatProductName", () => {
  it("adds the flavor and size when the product has them", () => {
    expect(formatProductName({ name: "وی", flavor: "شکلاتی", size: "۲ کیلو" })).toBe(
      "وی (شکلاتی، ۲ کیلو)"
    );
    expect(formatProductName({ name: "وی", size: "۲ کیلو" })).toBe("وی (۲ کیلو)");
  });

  it("returns the bare name otherwise", () => {
    expect(formatProductName({ name: "کراتین" })).toBe("کراتین");
  });
});

describe("formatOrderNumber", () => {
  it("uses the last 8 characters of the id, uppercased", () => {
    expect(formatOrderNumber("6ad20bba9ed7860dcd1b9185")).toBe("CD1B9185");
  });
});

describe("emailKindForAdminStatus", () => {
  it("maps each admin status change to its email", () => {
    expect(emailKindForAdminStatus("paid")).toBe("paid");
    expect(emailKindForAdminStatus("failed")).toBe("rejected");
    expect(emailKindForAdminStatus("shipped")).toBe("shipped");
    expect(emailKindForAdminStatus("cancelled")).toBe("cancelled");
  });

  it("sends nothing for statuses an admin can't set", () => {
    expect(emailKindForAdminStatus("pending")).toBeNull();
    expect(emailKindForAdminStatus("awaiting_verification")).toBeNull();
  });
});

describe("buildOrderEmail", () => {
  it("lists the items, discount, total and order number", () => {
    const email = buildOrderEmail(baseInput);
    expect(email.subject).toContain("CD1B9185");
    for (const body of [email.text, email.html]) {
      expect(body).toContain("وی پروتئین");
      expect(body).toContain((2_000_000).toLocaleString("fa-IR"));
      expect(body).toContain((200_000).toLocaleString("fa-IR"));
      expect(body).toContain((2_300_000).toLocaleString("fa-IR"));
      expect(body).toContain("CD1B9185");
    }
  });

  it("shows the ZarinPal reference only on payment confirmations", () => {
    expect(buildOrderEmail(baseInput).text).toContain("987654");
    expect(buildOrderEmail({ ...baseInput, kind: "shipped" }).text).not.toContain("987654");
  });

  it("leaves out the discount line when there is no discount", () => {
    const email = buildOrderEmail({ ...baseInput, discountAmount: undefined });
    expect(email.text).not.toContain("تخفیف");
    expect(email.html).not.toContain("تخفیف");
  });

  it("links members to their orders and guests to the shop", () => {
    expect(buildOrderEmail(baseInput).html).toContain('href="https://example.com/account/orders"');
    const guest = buildOrderEmail({ ...baseInput, hasAccount: false });
    expect(guest.html).not.toContain("/account/orders");
    expect(guest.html).toContain('href="https://example.com"');
  });

  it("escapes HTML the customer typed into their name and address", () => {
    const email = buildOrderEmail({
      ...baseInput,
      firstName: '<a href="https://evil.example">x</a>',
      address: { ...baseInput.address, address: "<script>alert(1)</script>" },
    });
    expect(email.html).not.toContain("<a href=\"https://evil.example\"");
    expect(email.html).not.toContain("<script>");
    expect(email.html).toContain("&lt;script&gt;");
  });

  it("uses a different subject for each kind of email", () => {
    const kinds = ["received", "paid", "rejected", "shipped", "cancelled"] as const;
    const subjects = new Set(kinds.map((kind) => buildOrderEmail({ ...baseInput, kind }).subject));
    expect(subjects.size).toBe(kinds.length);
  });
});

describe("buildAdminOrderEmail", () => {
  const cardOrder: AdminOrderEmailInput = {
    ...baseInput,
    kind: "card_received",
    paymentMethod: "card",
    refId: undefined,
    contact: { email: "buyer@example.com", mobile: "09121234567" },
    cardTransfer: { trackingCode: "TRK7788", cardLast4: "4321" },
  };

  it("warns in the subject and body when a late payment left a product short", () => {
    const email = buildAdminOrderEmail({ ...cardOrder, kind: "paid", oversold: ["وی <طلایی>", "کراتین"] });
    expect(email.subject).toContain("موجودی کافی نیست");
    expect(email.text).toContain("وی <طلایی>، کراتین");
    expect(email.html).toContain("وی &lt;طلایی&gt;، کراتین");
  });

  it("says nothing about stock when nothing is short", () => {
    const email = buildAdminOrderEmail({ ...cardOrder, kind: "paid", oversold: [] });
    expect(email.subject).not.toContain("موجودی");
    expect(email.text).not.toContain("هشدار");
    expect(email.html).not.toContain("هشدار");
  });

  it("gives the admin what's needed to check a card transfer", () => {
    const email = buildAdminOrderEmail(cardOrder);
    expect(email.subject).toContain("CD1B9185");
    for (const body of [email.text, email.html]) {
      expect(body).toContain("TRK7788");
      expect(body).toContain("4321");
      expect(body).toContain("09121234567");
      expect(body).toContain("buyer@example.com");
      expect(body).toContain((2_300_000).toLocaleString("fa-IR"));
    }
    expect(email.html).toContain('href="https://example.com/admin/orders"');
  });

  it("shows the ZarinPal reference for paid orders", () => {
    const email = buildAdminOrderEmail({
      ...cardOrder,
      kind: "paid",
      paymentMethod: "zarinpal",
      refId: 987654,
      cardTransfer: undefined,
    });
    expect(email.text).toContain("987654");
    expect(email.text).not.toContain("کد پیگیری واریز");
  });

  it("escapes everything the buyer typed", () => {
    const email = buildAdminOrderEmail({
      ...cardOrder,
      contact: { ...cardOrder.contact, mobile: "<img src=x onerror=alert(1)>" },
      cardTransfer: { trackingCode: "<b>x</b>", cardLast4: "1234" },
    });
    expect(email.html).not.toContain("<img");
    expect(email.html).not.toContain("<b>x</b>");
  });

  it("uses a different subject from the customer email", () => {
    expect(buildAdminOrderEmail({ ...cardOrder, kind: "paid" }).subject).not.toBe(
      buildOrderEmail(baseInput).subject
    );
  });
});
