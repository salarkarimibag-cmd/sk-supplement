import { connectToDatabase } from "@/lib/db";
import { DiscountCodeModel } from "@/models/DiscountCode";
import { checkDiscount } from "@/lib/discounts";

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

  const result = checkDiscount(discount, body.subtotal);

  return Response.json(result);
}
