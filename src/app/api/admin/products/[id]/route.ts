import { connectToDatabase } from "@/lib/db";
import { ProductModel } from "@/models/Product";
import { getSessionAdmin } from "@/lib/auth";

interface UpdateProductBody {
  name?: string;
  slug?: string;
  description?: string;
  price?: number;
  categorySlug?: string;
  imageUrl?: string;
  stock?: number;
  rating?: number;
  reviewCount?: number;
  flavor?: string;
  size?: string;
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
  const body: UpdateProductBody = await request.json();

  await connectToDatabase();

  const update: Record<string, unknown> = {};
  if (body.name) update.name = body.name;
  if (body.slug) update.slug = body.slug;
  if (body.description !== undefined) update.description = body.description;
  if (body.price !== undefined) update.price = body.price;
  if (body.categorySlug) update.categorySlug = body.categorySlug;
  if (body.imageUrl) update.imageUrl = body.imageUrl;
  if (body.stock !== undefined) update.stock = body.stock;
  if (body.rating !== undefined) update.rating = body.rating;
  if (body.reviewCount !== undefined) update.reviewCount = body.reviewCount;
  if (body.flavor !== undefined) update.flavor = body.flavor || undefined;
  if (body.size !== undefined) update.size = body.size || undefined;

  const product = await ProductModel.findOneAndUpdate({ id }, update, {
    returnDocument: "after",
  });

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
