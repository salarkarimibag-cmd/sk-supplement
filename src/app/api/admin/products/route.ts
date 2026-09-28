import { connectToDatabase } from "@/lib/db";
import { ProductModel } from "@/models/Product";
import { getSessionAdmin } from "@/lib/auth";

interface CreateProductBody {
  id?: string;
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

  const body: CreateProductBody = await request.json();

  if (
    !body.id ||
    !body.name ||
    !body.slug ||
    !body.price ||
    body.price <= 0 ||
    !body.categorySlug ||
    !body.imageUrl ||
    body.stock === undefined ||
    body.stock < 0
  ) {
    return Response.json(
      { message: "شناسه، نام، اسلاگ، قیمت، دسته‌بندی، تصویر و موجودی الزامی هستند." },
      { status: 400 }
    );
  }

  await connectToDatabase();

  const existing = await ProductModel.findOne({ $or: [{ id: body.id }, { slug: body.slug }] });
  if (existing) {
    return Response.json({ message: "این شناسه یا اسلاگ قبلاً ثبت شده است." }, { status: 409 });
  }

  const product = await ProductModel.create({
    id: body.id,
    name: body.name,
    slug: body.slug,
    description: body.description ?? "",
    price: body.price,
    categorySlug: body.categorySlug,
    imageUrl: body.imageUrl,
    stock: body.stock,
    rating: body.rating ?? 0,
    reviewCount: body.reviewCount ?? 0,
    flavor: body.flavor || undefined,
    size: body.size || undefined,
  });

  return Response.json(product, { status: 201 });
}
