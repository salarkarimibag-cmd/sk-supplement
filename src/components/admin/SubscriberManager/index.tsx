"use client";

import { useState } from "react";

interface SubscriberItem {
  id: string;
  email: string;
  ip: string;
  createdAt: string | null;
}

export default function SubscriberManager({
  initialSubscribers,
}: {
  initialSubscribers: SubscriberItem[];
}) {
  const [subscribers, setSubscribers] = useState(initialSubscribers);

  async function handleDelete(item: SubscriberItem) {
    if (!confirm(`مشترک «${item.email}» حذف شود؟`)) return;

    const response = await fetch(`/api/admin/subscribers/${item.id}`, { method: "DELETE" });
    if (!response.ok) {
      const data = await response.json();
      alert(data.message ?? "حذف ناموفق بود.");
      return;
    }

    setSubscribers((current) => current.filter((subscriber) => subscriber.id !== item.id));
  }

  return (
    <div className="mt-8 overflow-x-auto">
      <table className="w-full text-right text-sm">
        <thead>
          <tr className="border-b border-zinc-200 text-zinc-500 dark:border-zinc-800">
            <th className="py-2 font-medium">ایمیل</th>
            <th className="py-2 font-medium">IP</th>
            <th className="py-2 font-medium">تاریخ عضویت</th>
            <th className="py-2 font-medium">عملیات</th>
          </tr>
        </thead>
        <tbody>
          {subscribers.length === 0 && (
            <tr>
              <td colSpan={4} className="py-6 text-center text-zinc-500">
                هیچ مشترکی ثبت نشده است.
              </td>
            </tr>
          )}
          {subscribers.map((item) => (
            <tr key={item.id} className="border-b border-zinc-100 dark:border-zinc-900">
              <td className="py-2 font-semibold whitespace-nowrap" dir="ltr">
                {item.email}
              </td>
              <td className="py-2 whitespace-nowrap text-zinc-500" dir="ltr">
                {item.ip}
              </td>
              <td className="py-2 whitespace-nowrap text-zinc-500">
                {item.createdAt ? new Date(item.createdAt).toLocaleDateString("fa-IR") : "—"}
              </td>
              <td className="py-2">
                <button
                  type="button"
                  onClick={() => handleDelete(item)}
                  className="cursor-pointer text-red-600 hover:underline"
                >
                  حذف
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
