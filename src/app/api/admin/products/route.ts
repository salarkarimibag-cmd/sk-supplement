import { connectToDatabase } from "@/lib/db";
import { ProductModel } from "@/models/Product";
import { getSessionAdmin } from "@/lib/auth";
import { isDuplicateKeyError } from "@/lib/mongoErrors";
import { productDetailsSchema, withoutEmptyDetails } from "@/lib/productDetails";
import { productCreateSchema, productInputErrorMessage } from "@/lib/productInput";
import { productGroupSchema } from "@/lib/variants";

const DUPLICATE_MESSAGE = "این شناسه یا اسلاگ قبلاً ثبت شده است.";

export async function GET() {
  const admin = await getSessionAdmin();
  if (!admin) {
    return Response.json({ message: "دسترسی غیرمجاز." }, { status: 401 });
  }

  await connectToDatabase();
  const products = await ProductModel.find().sort({ name: 1 });
  return Response.json(products);
}

export async function POST(request: Request) {
  const admin = await getSessionAdmin();
  if (!admin) {
    return Response.json({ message: "دسترسی غیرمجاز." }, { status: 401 });
  }

  const body: unknown = await request.json().catch(() => null);

  const parsed = productCreateSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ message: productInputErrorMessage(parsed.error) }, { status: 400 });
  }
  const input = parsed.data;

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

  const existing = await ProductModel.exists({ $or: [{ id: input.id }, { slug: input.slug }] });
  if (existing) {
    return Response.json({ message: DUPLICATE_MESSAGE }, { status: 409 });
  }

  try {
    const product = await ProductModel.create({
      id: input.id,
      name: input.name,
      slug: input.slug,
      description: input.description ?? "",
      price: input.price,
      categorySlug: input.categorySlug,
      imageUrl: input.imageUrl,
      stock: input.stock,
      flavor: input.flavor || undefined,
      size: input.size || undefined,
      groupSlug: group.data.groupSlug || undefined,
      ...withoutEmptyDetails(details.data),
    });
    return Response.json(product, { status: 201 });
  } catch (error) {
    // Two saves of the same id or slug at once can both pass the check
    // above; the unique index rejects the second one here.
    if (isDuplicateKeyError(error)) {
      return Response.json({ message: DUPLICATE_MESSAGE }, { status: 409 });
    }
    throw error;
  }
}
