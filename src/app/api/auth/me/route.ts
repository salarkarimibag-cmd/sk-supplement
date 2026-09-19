import { getSessionUser } from "@/lib/auth";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return Response.json({ message: "وارد نشده‌اید." }, { status: 401 });
  }
  return Response.json(user);
}
