import { connectToDatabase } from "@/lib/db";
import { OrderModel } from "@/models/Order";

export async function GET() {
  await connectToDatabase();
  const orders = await OrderModel.find().sort({ createdAt: -1 });
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
