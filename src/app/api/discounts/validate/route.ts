import { checkDiscountForVisitor } from "@/lib/discountLookup";
import { getClientIp, getOrSetDeviceId } from "@/lib/rateLimit";

interface ValidateBody {
  code?: unknown;
  subtotal?: unknown;
}

export async function POST(request: Request) {
  const body: ValidateBody = (await request.json().catch(() => null)) ?? {};

  // typeof checks, so a non-string code (e.g. {"$ne": null}) can neither
  // crash .toUpperCase() nor reach the query as an operator.
  if (
    typeof body.code !== "string" ||
    !body.code.trim() ||
    typeof body.subtotal !== "number" ||
    body.subtotal <= 0
  ) {
    return Response.json({ valid: false, message: "کد تخفیف یا مبلغ نامعتبر است." }, { status: 400 });
  }

  const { result, rateLimited } = await checkDiscountForVisitor(body.code, body.subtotal, {
    ip: getClientIp(request),
    deviceId: await getOrSetDeviceId(),
  });

  // CheckoutView shows `message` for any response without `valid: true`.
  return Response.json(result, { status: rateLimited ? 429 : 200 });
}
