"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/account/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="cursor-pointer rounded border border-zinc-300 px-6 py-2.5 text-sm font-semibold dark:border-zinc-700"
    >
      خروج از حساب
    </button>
  );
}
