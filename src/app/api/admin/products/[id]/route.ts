import { connectToDatabase } from "@/lib/db";
import { ProductModel } from "@/models/Product";
import { getSessionAdmin } from "@/lib/auth";
import { isDuplicateKeyError } from "@/lib/mongoErrors";
import { toSetAndUnset } from "@/lib/mongoUpdate";
import { productDetailsSchema, withoutEmptyDetails } from "@/lib/productDetails";
import { productInputErrorMessage, productUpdateSchema } from "@/lib/productInput";
import { productGroupSchema } from "@/lib/variants";

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

  const parsed = productUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ message: productInputErrorMessage(parsed.error) }, { status: 400 });
  }

  const details = productDetailsSchema.safeParse(body);
  if (!details.success) {
    return Response.json({ message: "برند، ارزش غذایی یا روش مصرف نامعتبر است." }, { status: 400 });
  }

  const group = productGroupSchema.safeParse(body);
  if (!group.success) {
    return Response.json(
      { message: "گروه باید با حروف انگلیسی کوچک، عدد و خط تیره باشد (مثلاً whey-isolate)." },
      { status: 400 }
    );
  }

  await connectToDatabase();

  // Only the fields that were sent are in parsed.data, so the others keep
  // their saved values.
  const { flavor, size, ...fields } = parsed.data;
  const update: Record<string, unknown> = { ...fields };
  if (flavor !== undefined) update.flavor = flavor || undefined;
  if (size !== undefined) update.size = size || undefined;
  if (group.data.groupSlug !== undefined) update.groupSlug = group.data.groupSlug || undefined;
  Object.assign(update, withoutEmptyDetails(details.data));

  let product;
  try {
    // Cleared optional fields (flavor, size, group, label details) are undefined here
    // and must be removed explicitly, or Mongoose would keep the old values.
    product = await ProductModel.findOneAndUpdate({ id }, toSetAndUnset(update), {
      returnDocument: "after",
    });
  } catch (error) {
    // The new slug belongs to another product (the slug index is unique).
    if (isDuplicateKeyError(error)) {
      return Response.json({ message: "این اسلاگ قبلاً ثبت شده است." }, { status: 409 });
    }
    throw error;
  }

  if (!product) {
    return Response.json({ message: "محصول پیدا نشد." }, { status: 404 });
  }

  return Response.json(product);
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
  const product = await ProductModel.findOneAndDelete({ id });

  if (!product) {
    return Response.json({ message: "محصول پیدا نشد." }, { status: 404 });
  }

  return Response.json({ ok: true });
}
