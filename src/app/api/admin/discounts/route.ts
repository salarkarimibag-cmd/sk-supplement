import { connectToDatabase } from "@/lib/db";
import { DiscountCodeModel } from "@/models/DiscountCode";
import { getSessionAdmin } from "@/lib/auth";
import { discountInputSchema } from "@/lib/discounts";
import { revalidateHome } from "@/lib/revalidate";

export async function GET() {
  const admin = await getSessionAdmin();
  if (!admin) {
    return Response.json({ message: "دسترسی غیرمجاز." }, { status: 401 });
  }

  await connectToDatabase();
  const codes = await DiscountCodeModel.find().sort({ createdAt: -1 });
  return Response.json(codes);
}

export async function POST(request: Request) {
  const admin = await getSessionAdmin();
  if (!admin) {
    return Response.json({ message: "دسترسی غیرمجاز." }, { status: 401 });
  }

  const parsed = discountInputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "اطلاعات کد تخفیف نامعتبر است.";
    return Response.json({ message }, { status: 400 });
  }
  const input = parsed.data;

  await connectToDatabase();

  const existing = await DiscountCodeModel.findOne({ code: input.code });
  if (existing) {
    return Response.json({ message: "این کد قبلاً ثبت شده است." }, { status: 409 });
  }

  const discount = await DiscountCodeModel.create({
    ...input,
    expiresAt: input.expiresAt ?? undefined,
    maxUses: input.maxUses ?? undefined,
    minSubtotal: input.minSubtotal ?? undefined,
  });

  revalidateHome();
  return Response.json(discount, { status: 201 });
}
