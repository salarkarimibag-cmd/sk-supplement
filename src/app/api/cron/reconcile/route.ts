import { isCronAuthorized } from "@/lib/cronAuth";
import { releaseExpiredReservations } from "@/lib/orderLifecycle";
import { reconcileZarinPalOrders } from "@/lib/zarinpalOrders";

// Run by Vercel on the schedule in vercel.json. The same work as the admin's
// reconcile button, so a buyer who paid but never came back to the callback
// page gets their order without the admin having to notice. It also frees
// stock held by abandoned payments: product pages only do that when they're
// rebuilt, which needs a visitor.
export async function GET(request: Request) {
  if (!isCronAuthorized(request.headers.get("authorization"), process.env.CRON_SECRET)) {
    return Response.json({ message: "دسترسی غیرمجاز." }, { status: 401 });
  }

  await releaseExpiredReservations();
  const result = await reconcileZarinPalOrders();

  // The only record of a run, since nobody is watching the response.
  console.log("Reconciled ZarinPal orders:", result);
  return Response.json(result);
}
