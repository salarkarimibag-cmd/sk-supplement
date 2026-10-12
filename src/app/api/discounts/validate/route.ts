import { connectToDatabase } from "@/lib/db";
import { DiscountCodeModel } from "@/models/DiscountCode";
import { checkDiscount } from "@/lib/discounts";

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

  await connectToDatabase();

  const discount = await DiscountCodeModel.findOne({ code: body.code.toUpperCase().trim() });

  const result = checkDiscount(discount, body.subtotal);

  return Response.json(result);
}
