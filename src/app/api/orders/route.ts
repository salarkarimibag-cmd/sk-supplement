import { connectToDatabase } from "@/lib/db";
import { OrderModel } from "@/models/Order";
import { getSessionUser } from "@/lib/auth";

// Only ever returns the logged-in user's own orders — never the whole
// collection, since this is a customer-facing route (see src/app/account/orders).
export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return Response.json({ message: "وارد نشده‌اید." }, { status: 401 });
  }

  await connectToDatabase();
  const orders = await OrderModel.find({ userId: user.id }).sort({ createdAt: -1 });
  return Response.json(orders);
}

// Checkout creates orders via /api/payment (it needs the order to exist
// before redirecting to ZarinPal). This route is kept for direct/manual
// order creation, e.g. testing.
export async function POST(request: Request) {
  await connectToDatabase();
  const body = await request.json();
  const order = await OrderModel.create(body);
  return Response.json(order, { status: 201 });
}
