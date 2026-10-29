// ZarinPal Payment Gateway (REST API v4). Docs: https://www.zarinpal.com/docs/paymentGateway/
const MERCHANT_ID = process.env.ZARINPAL_MERCHANT_ID ?? "";
const IS_SANDBOX = process.env.ZARINPAL_SANDBOX !== "false";

const BASE_URL = IS_SANDBOX ? "https://sandbox.zarinpal.com" : "https://payment.zarinpal.com";
const REQUEST_URL = `${BASE_URL}/pg/v4/payment/request.json`;
const VERIFY_URL = `${BASE_URL}/pg/v4/payment/verify.json`;
const INQUIRY_URL = `${BASE_URL}/pg/v4/payment/inquiry.json`;

function startPayUrl(authority: string): string {
  return `${BASE_URL}/pg/StartPay/${authority}`;
}

/** ZarinPal expects the amount in Rial; catalog prices are stored in Toman. */
function tomanToRial(amountToman: number): number {
  return amountToman * 10;
}

interface RequestPaymentParams {
  amountToman: number;
  description: string;
  callbackUrl: string;
  email?: string;
  mobile?: string;
}

// Long enough for a slow gateway, short enough that the buyer isn't left
// staring at a spinner (fetch has no timeout of its own).
const GATEWAY_TIMEOUT_MS = 15_000;

const UNREACHABLE_MESSAGE =
  "ارتباط با درگاه زرین‌پال برقرار نشد. لطفاً چند لحظه‌ی دیگر دوباره تلاش کنید.";

// Buyers see these plain messages; what went wrong technically (a missing
// setting, ZarinPal's own English error text) goes to the server log, where
// the developer can see it and the buyer can't.
const UNAVAILABLE_MESSAGE = "پرداخت آنلاین موقتاً در دسترس نیست. لطفاً کمی بعد دوباره تلاش کنید.";
const REQUEST_FAILED_MESSAGE = "درخواست پرداخت زرین‌پال ناموفق بود. لطفاً دوباره تلاش کنید.";
const VERIFY_FAILED_MESSAGE =
  "پرداخت تأیید نشد. اگر مبلغی از حساب شما کسر شده، با پشتیبانی تماس بگیرید.";

function logMissingMerchantId() {
  console.error(
    "ZARINPAL_MERCHANT_ID is not set: add it to .env.local locally, or to the project's environment variables on Vercel."
  );
}

function logGatewayError(step: "request" | "verify" | "inquiry", json: GatewayResponse) {
  console.error(`ZarinPal ${step} was declined:`, JSON.stringify(json.errors ?? json.data ?? json));
}

/**
 * POSTs to ZarinPal and returns the parsed JSON, or null when the gateway
 * couldn't be reached or didn't answer with JSON (timeout, DNS/network
 * failure, an HTML error page). That's different from ZarinPal answering
 * "no", which comes back as JSON with an error code.
 */
interface GatewayResponse {
  data?: { authority?: string; code?: number; ref_id?: number; status?: string };
  errors?: { code?: number; message?: string };
}

async function postToGateway(url: string, body: object): Promise<GatewayResponse | null> {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(GATEWAY_TIMEOUT_MS),
    });
    return await response.json();
  } catch {
    return null;
  }
}

type RequestPaymentResult =
  | { ok: true; authority: string; paymentUrl: string }
  | { ok: false; message: string };

export async function requestZarinPalPayment(
  params: RequestPaymentParams
): Promise<RequestPaymentResult> {
  if (!MERCHANT_ID) {
    logMissingMerchantId();
    return { ok: false, message: UNAVAILABLE_MESSAGE };
  }

  const json = await postToGateway(REQUEST_URL, {
    merchant_id: MERCHANT_ID,
    amount: tomanToRial(params.amountToman),
    description: params.description,
    callback_url: params.callbackUrl,
    metadata: { email: params.email, mobile: params.mobile },
  });
  if (!json) {
    return { ok: false, message: UNREACHABLE_MESSAGE };
  }

  const authority: string | undefined = json?.data?.authority;
  const code: number | undefined = json?.data?.code;

  if (!authority || code !== 100) {
    logGatewayError("request", json);
    return { ok: false, message: REQUEST_FAILED_MESSAGE };
  }

  return { ok: true, authority, paymentUrl: startPayUrl(authority) };
}

interface VerifyPaymentParams {
  amountToman: number;
  authority: string;
}

// `retryable` marks "we couldn't ask ZarinPal" as opposed to "ZarinPal said
// the payment failed": in the first case the buyer may well have paid, so
// the order must not be marked failed — asking again later can still verify it.
type VerifyPaymentResult =
  | { ok: true; refId: number }
  | { ok: false; retryable: boolean; message: string };

export async function verifyZarinPalPayment(
  params: VerifyPaymentParams
): Promise<VerifyPaymentResult> {
  if (!MERCHANT_ID) {
    // Retryable: the buyer may have paid, and once the setting is restored a
    // reload of the callback page can still verify it.
    logMissingMerchantId();
    return {
      ok: false,
      retryable: true,
      message:
        "تأیید پرداخت موقتاً ممکن نیست. اگر مبلغ از حساب شما کسر شده، کمی بعد این صفحه را دوباره بارگذاری کنید.",
    };
  }

  const json = await postToGateway(VERIFY_URL, {
    merchant_id: MERCHANT_ID,
    amount: tomanToRial(params.amountToman),
    authority: params.authority,
  });
  if (!json) {
    return {
      ok: false,
      retryable: true,
      message:
        "ارتباط با درگاه زرین‌پال برای تأیید پرداخت برقرار نشد. اگر مبلغ از حساب شما کسر شده، چند لحظه‌ی دیگر این صفحه را دوباره بارگذاری کنید.",
    };
  }

  const code: number | undefined = json?.data?.code;
  const refId: number | undefined = json?.data?.ref_id;

  // 100 = newly verified, 101 = already verified (e.g. user refreshed the callback page).
  if ((code === 100 || code === 101) && refId) {
    return { ok: true, refId };
  }

  logGatewayError("verify", json);
  return { ok: false, retryable: false, message: VERIFY_FAILED_MESSAGE };
}

/**
 * What ZarinPal knows about a payment whose buyer never came back to the
 * callback page (closed the tab, lost the connection): "paid" (verified or
 * not yet), "failed" (never paid, or paid and reversed), "in_bank" (not
 * paid yet: the buyer may still be paying, or left the gateway without
 * cancelling) or "unknown" (ZarinPal couldn't be asked). It only reports:
 * ZarinPal's docs forbid treating it as a verification, so a "paid" answer
 * must still go through verifyZarinPalPayment before the order counts as paid.
 */
export type PaymentInquiry = "paid" | "failed" | "in_bank" | "unknown";

export async function inquireZarinPalPayment(authority: string): Promise<PaymentInquiry> {
  if (!MERCHANT_ID) {
    logMissingMerchantId();
    return "unknown";
  }

  const json = await postToGateway(INQUIRY_URL, { merchant_id: MERCHANT_ID, authority });
  switch (json?.data?.status) {
    case "PAID":
    case "VERIFIED":
      return "paid";
    case "FAILED":
    case "REVERSED":
      return "failed";
    case "IN_BANK":
      return "in_bank";
  }

  if (json) logGatewayError("inquiry", json);
  return "unknown";
}
