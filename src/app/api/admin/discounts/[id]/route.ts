import { isValidObjectId } from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { DiscountCodeModel, type DiscountCode } from "@/models/DiscountCode";
import { getSessionAdmin } from "@/lib/auth";
import { discountInputSchema } from "@/lib/discounts";
import { revalidateHome } from "@/lib/revalidate";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getSessionAdmin();
  if (!admin) {
    return Response.json({ message: "دسترسی غیرمجاز." }, { status: 401 });
  }

  const { id } = await params;
  const body: unknown = await request.json().catch(() => null);
  if (!isValidObjectId(id) || typeof body !== "object" || body === null) {
    return Response.json({ message: "درخواست نامعتبر است." }, { status: 400 });
  }

  await connectToDatabase();

  const existing = await DiscountCodeModel.findById(id).lean<DiscountCode>();
  if (!existing) {
    return Response.json({ message: "کد تخفیف پیدا نشد." }, { status: 404 });
  }

  // The edit is laid over the saved code and the *result* is validated, so a
  // change to one field is checked against the others too: switching a fixed
  // 50,000 discount to "percent" without changing the value is rejected.
  const parsed = discountInputSchema.safeParse({
    code: existing.code,
    type: existing.type,
    value: existing.value,
    active: existing.active,
    expiresAt: existing.expiresAt ? existing.expiresAt.toISOString().slice(0, 10) : null,
    maxUses: existing.maxUses ?? null,
    minSubtotal: existing.minSubtotal ?? null,
    firstOrderOnly: existing.firstOrderOnly ?? false,
    ...body,
  });
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "اطلاعات کد تخفیف نامعتبر است.";
    return Response.json({ message }, { status: 400 });
  }
  const { expiresAt, maxUses, minSubtotal, ...fields } = parsed.data;

  if (fields.code !== existing.code) {
    const taken = await DiscountCodeModel.exists({ code: fields.code, _id: { $ne: id } });
    if (taken) {
      return Response.json({ message: "این کد قبلاً ثبت شده است." }, { status: 409 });
    }
  }

  // Cleared optional fields are removed ($unset) rather than stored as null.
  const unset: Record<string, ""> = {};
  if (expiresAt === null) unset.expiresAt = "";
  if (maxUses === null) unset.maxUses = "";
  if (minSubtotal === null) unset.minSubtotal = "";

  const discount = await DiscountCodeModel.findByIdAndUpdate(
    id,
    {
      $set: {
        ...fields,
        ...(expiresAt !== null && { expiresAt }),
        ...(maxUses !== null && { maxUses }),
        ...(minSubtotal !== null && { minSubtotal }),
      },
      ...(Object.keys(unset).length > 0 && { $unset: unset }),
    },
    { returnDocument: "after" }
  );

  revalidateHome();
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
  if (!isValidObjectId(id)) {
    return Response.json({ message: "کد تخفیف پیدا نشد." }, { status: 404 });
  }

  await connectToDatabase();
  const discount = await DiscountCodeModel.findByIdAndDelete(id);

  if (!discount) {
    return Response.json({ message: "کد تخفیف پیدا نشد." }, { status: 404 });
  }

  revalidateHome();
  return Response.json({ ok: true });
}
