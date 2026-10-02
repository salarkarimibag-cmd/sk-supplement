"use client";

import { useState } from "react";

interface MessageItem {
  id: string;
  name: string;
  email: string;
  message: string;
  ip: string;
  createdAt: string | null;
}

export default function MessageManager({ initialMessages }: { initialMessages: MessageItem[] }) {
  const [messages, setMessages] = useState(initialMessages);

  async function handleDelete(item: MessageItem) {
    if (!confirm(`پیام «${item.name}» حذف شود؟`)) return;

    const response = await fetch(`/api/admin/messages/${item.id}`, { method: "DELETE" });
    if (!response.ok) {
      const data = await response.json();
      alert(data.message ?? "حذف ناموفق بود.");
      return;
    }

    setMessages((current) => current.filter((message) => message.id !== item.id));
  }

  return (
    <div className="mt-8 overflow-x-auto">
      <table className="w-full text-right text-sm">
        <thead>
          <tr className="border-b border-zinc-200 text-zinc-500 dark:border-zinc-800">
            <th className="py-2 font-medium">نام</th>
            <th className="py-2 font-medium">ایمیل</th>
            <th className="py-2 font-medium">پیام</th>
            <th className="py-2 font-medium">IP</th>
            <th className="py-2 font-medium">تاریخ</th>
            <th className="py-2 font-medium">عملیات</th>
          </tr>
        </thead>
        <tbody>
          {messages.length === 0 && (
            <tr>
              <td colSpan={6} className="py-6 text-center text-zinc-500">
                هیچ پیامی ثبت نشده است.
              </td>
            </tr>
          )}
          {messages.map((item) => (
            <tr key={item.id} className="border-b border-zinc-100 align-top dark:border-zinc-900">
              <td className="py-2 font-semibold whitespace-nowrap">{item.name}</td>
              <td className="py-2 whitespace-nowrap" dir="ltr">
                {item.email}
              </td>
              <td className="max-w-xs py-2">{item.message}</td>
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
