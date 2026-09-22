import { connectToDatabase } from "@/lib/db";
import { DiscountCodeModel } from "@/models/DiscountCode";
import { getSessionAdmin } from "@/lib/auth";

interface UpdateDiscountBody {
  code?: string;
  type?: "percent" | "fixed";
  value?: number;
  active?: boolean;
  expiresAt?: string | null;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getSessionAdmin();
  if (!admin) {
    return Response.json({ message: "دسترسی غیرمجاز." }, { status: 401 });
  }

  const { id } = await params;
  const body: UpdateDiscountBody = await request.json();

  await connectToDatabase();

  const update: Record<string, unknown> = {};
  if (body.code) update.code = body.code.toUpperCase().trim();
  if (body.type) update.type = body.type;
  if (body.value !== undefined) update.value = body.value;
  if (body.active !== undefined) update.active = body.active;
  if (body.expiresAt !== undefined) update.expiresAt = body.expiresAt || null;

  const discount = await DiscountCodeModel.findByIdAndUpdate(id, update, {
    returnDocument: "after",
  });

  if (!discount) {
    return Response.json({ message: "کد تخفیف پیدا نشد." }, { status: 404 });
  }

  return Response.json(discount);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getSessionAdmin();
  if (!admin) {
    return Response.json({ message: "دسترسی غیرمجاز." }, { status: 401 });
  }

  const { id } = await params;

  await connectToDatabase();
  const discount = await DiscountCodeModel.findByIdAndDelete(id);

  if (!discount) {
    return Response.json({ message: "کد تخفیف پیدا نشد." }, { status: 404 });
  }

  return Response.json({ ok: true });
}
