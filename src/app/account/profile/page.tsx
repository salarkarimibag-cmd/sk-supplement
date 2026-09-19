import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import LogoutButton from "@/components/account/LogoutButton";

export const metadata: Metadata = {
  title: "پروفایل کاربری",
  robots: { index: false, follow: false },
};

export default async function ProfilePage() {
  const user = await getSessionUser();
  if (!user) redirect("/account/login");

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12">
      <h1 className="text-2xl font-bold">پروفایل کاربری</h1>

      <dl className="mt-6 flex max-w-md flex-col gap-3 text-sm">
        <div className="flex justify-between border-b border-zinc-200 pb-3 dark:border-zinc-800">
          <dt className="text-zinc-500">نام و نام خانوادگی</dt>
          <dd className="font-semibold">{user.fullName}</dd>
        </div>
        <div className="flex justify-between border-b border-zinc-200 pb-3 dark:border-zinc-800">
          <dt className="text-zinc-500">ایمیل</dt>
          <dd className="font-semibold">{user.email}</dd>
        </div>
        <div className="flex justify-between border-b border-zinc-200 pb-3 dark:border-zinc-800">
          <dt className="text-zinc-500">شماره موبایل</dt>
          <dd className="font-semibold">{user.phone}</dd>
        </div>
      </dl>

      <div className="mt-8">
        <LogoutButton />
      </div>
    </div>
  );
}
