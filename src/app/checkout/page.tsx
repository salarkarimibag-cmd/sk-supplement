import type { Metadata } from "next";
import CheckoutView from "@/components/checkout/CheckoutView";

export const metadata: Metadata = {
  title: "تسویه حساب",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return <CheckoutView />;
}
