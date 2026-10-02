import { connectToDatabase } from "@/lib/db";
import { SubscriberModel } from "@/models/Subscriber";
import { getSessionAdmin } from "@/lib/auth";

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
  const subscriber = await SubscriberModel.findByIdAndDelete(id);

  if (!subscriber) {
    return Response.json({ message: "مشترک پیدا نشد." }, { status: 404 });
  }

  return Response.json({ ok: true });
}
