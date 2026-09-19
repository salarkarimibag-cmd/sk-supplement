import type { Metadata } from "next";
import RegisterForm from "@/components/account/RegisterForm";

export const metadata: Metadata = {
  title: "ثبت‌نام",
  robots: { index: false, follow: false },
};

export default function RegisterPage() {
  return (
    <div className="mx-auto w-full max-w-md px-6 py-12">
      <h1 className="text-2xl font-bold">ثبت‌نام</h1>
      <RegisterForm />
    </div>
  );
}
