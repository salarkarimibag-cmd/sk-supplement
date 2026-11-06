import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import AdminTabs from "@/components/admin/AdminTabs";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/account/login");

  if (!user.isAdmin) {
    return (
      <div className="mx-auto w-full max-w-3xl px-6 py-16 text-center">
        <h1 className="text-2xl font-bold">دسترسی غیرمجاز</h1>
        <p className="mt-3 text-zinc-600 dark:text-zinc-400">
          این صفحه فقط برای مدیران سایت در دسترس است.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-12">
      <h1 className="text-2xl font-bold">پنل مدیریت</h1>

      <AdminTabs />

      <div className="mt-8">{children}</div>
    </div>
  );
}
