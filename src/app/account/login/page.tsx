import type { Metadata } from "next";
import LoginForm from "@/components/account/LoginForm";
import { getSafeRedirectPath } from "@/lib/safeRedirect";

export const metadata: Metadata = {
  title: "ورود",
  robots: { index: false, follow: false },
};

export default async function LoginPage(props: PageProps<"/account/login">) {
  const { next } = await props.searchParams;
  const redirectTo = getSafeRedirectPath(next, "/account/profile");

  return (
    <div className="mx-auto w-full max-w-md px-6 py-12">
      <h1 className="text-2xl font-bold">ورود</h1>
      <LoginForm redirectTo={redirectTo} />
    </div>
  );
}
