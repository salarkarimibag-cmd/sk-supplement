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

  const response = await fetch(REQUEST_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      merchant_id: MERCHANT_ID,
      amount: tomanToRial(params.amountToman),
      description: params.description,
      callback_url: params.callbackUrl,
      metadata: { email: params.email, mobile: params.mobile },
    }),
  });

  const json = await response.json();
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

type VerifyPaymentResult = { ok: true; refId: number } | { ok: false; message: string };

export async function verifyZarinPalPayment(
  params: VerifyPaymentParams
): Promise<VerifyPaymentResult> {
  if (!MERCHANT_ID) {
    return { ok: false, message: "ZARINPAL_MERCHANT_ID تنظیم نشده است." };
  }

  const response = await fetch(VERIFY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      merchant_id: MERCHANT_ID,
      amount: tomanToRial(params.amountToman),
      authority: params.authority,
    }),
  });

  const json = await response.json();
  const code: number | undefined = json?.data?.code;
  const refId: number | undefined = json?.data?.ref_id;

  // 100 = newly verified, 101 = already verified (e.g. user refreshed the callback page).
  if ((code === 100 || code === 101) && refId) {
    return { ok: true, refId };
  }

  return { ok: false, message: json?.errors?.message ?? "تایید پرداخت ناموفق بود." };
}
