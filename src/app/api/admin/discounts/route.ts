import { connectToDatabase } from "@/lib/db";
import { DiscountCodeModel } from "@/models/DiscountCode";
import { getSessionAdmin } from "@/lib/auth";

interface CreateDiscountBody {
  code?: string;
  type?: "percent" | "fixed";
  value?: number;
  active?: boolean;
  expiresAt?: string | null;
}

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

  const body: CreateDiscountBody = await request.json();

  if (!body.code || !body.type || !body.value || body.value <= 0) {
    return Response.json({ message: "کد، نوع و مقدار الزامی هستند." }, { status: 400 });
  }

  await connectToDatabase();

  const existing = await DiscountCodeModel.findOne({ code: body.code.toUpperCase().trim() });
  if (existing) {
    return Response.json({ message: "این کد قبلاً ثبت شده است." }, { status: 409 });
  }

  const discount = await DiscountCodeModel.create({
    code: body.code.toUpperCase().trim(),
    type: body.type,
    value: body.value,
    active: body.active ?? true,
    expiresAt: body.expiresAt || undefined,
  });

  return Response.json(discount, { status: 201 });
}
