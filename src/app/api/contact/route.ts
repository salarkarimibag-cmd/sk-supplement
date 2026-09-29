import { connectToDatabase } from "@/lib/db";
import { ContactMessageModel } from "@/models/ContactMessage";

interface ContactBody {
  name?: string;
  email?: string;
  message?: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  const body: ContactBody = await request.json();
  const name = body.name?.trim();
  const email = body.email?.trim().toLowerCase();
  const message = body.message?.trim();

  if (!name || !email || !message || !EMAIL_PATTERN.test(email)) {
    return Response.json(
      { message: "نام، ایمیل معتبر و متن پیام الزامی هستند." },
      { status: 400 }
    );
  }

  await connectToDatabase();
  await ContactMessageModel.create({ name, email, message });

  return Response.json({ message: "پیام شما با موفقیت ارسال شد. به‌زودی با شما تماس می‌گیریم." });
}
