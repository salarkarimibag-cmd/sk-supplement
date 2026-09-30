import { connectToDatabase } from "@/lib/db";
import { ReviewModel } from "@/models/Review";
import { getSessionAdmin } from "@/lib/auth";

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

  await connectToDatabase();

  const update: Record<string, unknown> = {};
  if (body.approved !== undefined) update.approved = body.approved;

  const review = await ReviewModel.findByIdAndUpdate(id, update, {
    returnDocument: "after",
  });

  if (!review) {
    return Response.json({ message: "نظر پیدا نشد." }, { status: 404 });
  }

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

  return Response.json({ ok: true });
}
