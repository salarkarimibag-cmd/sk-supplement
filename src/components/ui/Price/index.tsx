import { COMING_SOON_LABEL, SALES_OPEN } from "@/lib/sales";

interface PriceProps {
  /** In Toman. */
  amount: number;
}

/** A price in Toman, or "به زودی" while sales haven't opened (see src/lib/sales.ts). */
export default function Price({ amount }: PriceProps) {
  return SALES_OPEN ? `${amount.toLocaleString("fa-IR")} تومان` : COMING_SOON_LABEL;
}
