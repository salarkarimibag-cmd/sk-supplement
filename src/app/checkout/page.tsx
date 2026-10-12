import type { Metadata } from "next";
import CheckoutView from "@/components/checkout/CheckoutView";
import { getShopCard } from "@/lib/cardPayment";

export const metadata: Metadata = {
  title: "تسویه حساب",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  // Read on the server, where the CARD_* env vars live, and passed down as
  // a prop: the client component can't read non-public env vars itself.
  return <CheckoutView shopCard={getShopCard()} />;
}
