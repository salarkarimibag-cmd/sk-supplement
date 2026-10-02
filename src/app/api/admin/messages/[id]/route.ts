import { connectToDatabase } from "@/lib/db";
import { ContactMessageModel } from "@/models/ContactMessage";
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
  const message = await ContactMessageModel.findByIdAndDelete(id);

  if (!message) {
    return Response.json({ message: "پیام پیدا نشد." }, { status: 404 });
  }

  return Response.json({ ok: true });
}
