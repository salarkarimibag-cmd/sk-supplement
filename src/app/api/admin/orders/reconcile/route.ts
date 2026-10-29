import { getSessionAdmin } from "@/lib/auth";
import { reconcileZarinPalOrders } from "@/lib/zarinpalOrders";

// Asks ZarinPal about the ZarinPal orders still pending and settles them
// (see reconcileZarinPalOrders); answers with how many became paid, failed
// or are still unknown.
export async function POST() {
  const admin = await getSessionAdmin();
  if (!admin) {
    return Response.json({ message: "دسترسی غیرمجاز." }, { status: 401 });
  }

  return Response.json(await reconcileZarinPalOrders());
}
