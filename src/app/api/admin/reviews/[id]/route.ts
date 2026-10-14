import { connectToDatabase } from "@/lib/db";
import { ReviewModel } from "@/models/Review";
import { getSessionAdmin } from "@/lib/auth";
import { refreshProductRating } from "@/lib/reviews";

interface UpdateReviewBody {
  approved?: boolean;
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
  const body: UpdateReviewBody = await request.json();

  if (typeof body.approved !== "boolean") {
    return Response.json({ message: "وضعیت تایید نامعتبر است." }, { status: 400 });
  }

  await connectToDatabase();

  const review = await ReviewModel.findByIdAndUpdate(
    id,
    { approved: body.approved },
    { returnDocument: "after" }
  );

  if (!review) {
    return Response.json({ message: "نظر پیدا نشد." }, { status: 404 });
  }

  // Only approved reviews count toward a product's rating.
  if (review.productId) await refreshProductRating(review.productId);

  return Response.json(review);
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
  const review = await ReviewModel.findByIdAndDelete(id);

  if (!review) {
    return Response.json({ message: "نظر پیدا نشد." }, { status: 404 });
  }

  // A pending review never counted, so only an approved one changes the rating.
  if (review.productId && review.approved) await refreshProductRating(review.productId);

  return Response.json({ ok: true });
}
