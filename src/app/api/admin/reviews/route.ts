import { connectToDatabase } from "@/lib/db";
import { ReviewModel } from "@/models/Review";
import { getSessionAdmin } from "@/lib/auth";

export async function GET() {
  const admin = await getSessionAdmin();
  if (!admin) {
    return Response.json({ message: "دسترسی غیرمجاز." }, { status: 401 });
  }

  await connectToDatabase();
  const reviews = await ReviewModel.find().sort({ createdAt: -1 });
  return Response.json(reviews);
}
