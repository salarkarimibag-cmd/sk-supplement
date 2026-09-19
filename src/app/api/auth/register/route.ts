import { connectToDatabase } from "@/lib/db";
import { UserModel } from "@/models/User";
import { hashPassword, createSessionCookie } from "@/lib/auth";

interface RegisterBody {
  fullName?: string;
  email?: string;
  phone?: string;
  password?: string;
}

export async function POST(request: Request) {
  const body: RegisterBody = await request.json();

  if (!body.fullName || !body.email || !body.phone || !body.password) {
    return Response.json({ message: "همه‌ی فیلدها الزامی هستند." }, { status: 400 });
  }
  if (body.password.length < 8) {
    return Response.json({ message: "رمز عبور باید حداقل ۸ کاراکتر باشد." }, { status: 400 });
  }

  await connectToDatabase();

  const existing = await UserModel.findOne({ email: body.email });
  if (existing) {
    return Response.json({ message: "این ایمیل قبلاً ثبت شده است." }, { status: 409 });
  }

  const passwordHash = await hashPassword(body.password);
  const user = await UserModel.create({
    fullName: body.fullName,
    email: body.email,
    phone: body.phone,
    passwordHash,
  });

  await createSessionCookie(user.id);

  return Response.json(
    { id: user.id, fullName: user.fullName, email: user.email, phone: user.phone },
    { status: 201 }
  );
}
