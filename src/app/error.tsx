"use client"; // Error boundaries must be Client Components

import ErrorMessage from "@/components/layout/ErrorMessage";

export default function ErrorPage({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return <ErrorMessage error={error} retry={retry} />;
}
