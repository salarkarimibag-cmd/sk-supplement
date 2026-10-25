import Skeleton from "@/components/ui/Skeleton";

// Shared by the login, register, forgot-password and reset-password pages:
// a narrow column with a title and a few form fields. orders/ and profile/
// have their own loading.tsx, which takes precedence for those routes.
export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-md px-6 py-12">
      <Skeleton className="h-8 w-32" />

      <div className="mt-6 flex flex-col gap-4">
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-11 w-full" />
      </div>
    </div>
  );
}
