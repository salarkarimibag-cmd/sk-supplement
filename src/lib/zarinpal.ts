// ZarinPal Payment Gateway (REST API v4). Docs: https://www.zarinpal.com/docs/paymentGateway/
const MERCHANT_ID = process.env.ZARINPAL_MERCHANT_ID ?? "";
const IS_SANDBOX = process.env.ZARINPAL_SANDBOX !== "false";

const BASE_URL = IS_SANDBOX ? "https://sandbox.zarinpal.com" : "https://payment.zarinpal.com";
const REQUEST_URL = `${BASE_URL}/pg/v4/payment/request.json`;
const VERIFY_URL = `${BASE_URL}/pg/v4/payment/verify.json`;

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

/**
 * POSTs to ZarinPal and returns the parsed JSON, or null when the gateway
 * couldn't be reached or didn't answer with JSON (timeout, DNS/network
 * failure, an HTML error page). That's different from ZarinPal answering
 * "no", which comes back as JSON with an error code.
 */
interface GatewayResponse {
  data?: { authority?: string; code?: number; ref_id?: number };
  errors?: { message?: string };
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
    return {
      ok: false,
      message: "ZARINPAL_MERCHANT_ID تنظیم نشده است. آن را در فایل .env.local مقداردهی کنید.",
    };
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
    return { ok: false, message: json?.errors?.message ?? "درخواست پرداخت زرین‌پال ناموفق بود." };
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
    return { ok: false, retryable: true, message: "ZARINPAL_MERCHANT_ID تنظیم نشده است." };
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

  return { ok: false, retryable: false, message: json?.errors?.message ?? "تایید پرداخت ناموفق بود." };
}
