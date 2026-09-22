import { connectToDatabase } from "@/lib/db";
import { DiscountCodeModel } from "@/models/DiscountCode";

interface ValidateBody {
  code?: string;
  subtotal?: number;
}

export async function POST(request: Request) {
  const body: ValidateBody = await request.json();

  if (!body.code || !body.subtotal || body.subtotal <= 0) {
    return Response.json({ valid: false, message: "کد تخفیف یا مبلغ نامعتبر است." }, { status: 400 });
  }

  await connectToDatabase();

  const discount = await DiscountCodeModel.findOne({ code: body.code.toUpperCase().trim() });

  if (!discount || !discount.active) {
    return Response.json({ valid: false, message: "کد تخفیف نامعتبر است." });
  }
  if (discount.expiresAt && discount.expiresAt.getTime() < Date.now()) {
    return Response.json({ valid: false, message: "کد تخفیف منقضی شده است." });
  }

  const discountAmount =
    discount.type === "percent"
      ? Math.round((body.subtotal * discount.value) / 100)
      : Math.min(discount.value, body.subtotal);

  return Response.json({ valid: true, code: discount.code, discountAmount });
}
