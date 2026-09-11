import type { Order } from "@/models/Order";

// TODO: read/write orders in MongoDB via `connectToDatabase()`.
export async function GET() {
  const orders: Order[] = [];
  return Response.json(orders);
}

export async function POST(request: Request) {
  const body = await request.json();
  return Response.json({ message: "Order creation not implemented yet.", body }, { status: 501 });
}
