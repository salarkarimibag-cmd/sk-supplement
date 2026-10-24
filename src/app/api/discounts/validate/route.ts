import { findAndCheckDiscount } from "@/lib/discountLookup";

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

  const { result } = await findAndCheckDiscount(body.code, body.subtotal);

  return Response.json(result);
}
