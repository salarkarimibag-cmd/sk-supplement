import type { Metadata } from "next";
import RegisterForm from "@/components/account/RegisterForm";
import { getSafeRedirectPath } from "@/lib/safeRedirect";

export const metadata: Metadata = {
  title: "ثبت‌نام",
  robots: { index: false, follow: false },
};

export default async function RegisterPage(props: PageProps<"/account/register">) {
  const { next } = await props.searchParams;
  const redirectTo = getSafeRedirectPath(next, "/account/profile");

  return (
    <div className="mx-auto w-full max-w-md px-6 py-12">
      <h1 className="text-2xl font-bold">ثبت‌نام</h1>
      <RegisterForm redirectTo={redirectTo} />
    </div>
  );
}
