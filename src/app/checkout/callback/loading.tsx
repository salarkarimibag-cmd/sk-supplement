import Skeleton from "@/components/ui/Skeleton";

// Mirrors the PaymentResult card shown once ZarinPal's answer has been verified.
export default function Loading() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center px-6 py-20">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="mt-3 h-4 w-40" />
      <Skeleton className="mt-8 h-11 w-40" />
    </div>
  );
}
