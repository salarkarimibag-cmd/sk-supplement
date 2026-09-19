import { connectToDatabase } from "@/lib/db";
import { UserModel } from "@/models/User";
import { verifyPassword, createSessionCookie } from "@/lib/auth";

interface LoginBody {
  email?: string;
  password?: string;
}

export async function POST(request: Request) {
  const body: LoginBody = await request.json();

  if (!body.email || !body.password) {
    return Response.json({ message: "ایمیل و رمز عبور الزامی هستند." }, { status: 400 });
  }

  await connectToDatabase();

  const user = await UserModel.findOne({ email: body.email });
  const passwordMatches = user ? await verifyPassword(body.password, user.passwordHash) : false;

  if (!user || !passwordMatches) {
    return Response.json({ message: "ایمیل یا رمز عبور اشتباه است." }, { status: 401 });
  }

  await createSessionCookie(user.id);

  return Response.json({ id: user.id, fullName: user.fullName, email: user.email, phone: user.phone });
}
