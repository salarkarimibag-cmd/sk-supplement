"use client";

import { useState } from "react";

interface ReviewItem {
  id: string;
  name: string;
  rating: number;
  comment: string;
  approved: boolean;
  ip: string;
  createdAt: string | null;
}

export default function ReviewManager({ initialReviews }: { initialReviews: ReviewItem[] }) {
  const [reviews, setReviews] = useState(initialReviews);

  async function toggleApproved(item: ReviewItem) {
    const response = await fetch(`/api/admin/reviews/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approved: !item.approved }),
    });

    if (!response.ok) {
      const data = await response.json();
      alert(data.message ?? "عملیات ناموفق بود.");
      return;
    }

    setReviews((current) =>
      current.map((review) =>
        review.id === item.id ? { ...review, approved: !review.approved } : review
      )
    );
  }

  async function handleDelete(item: ReviewItem) {
    if (!confirm(`نظر «${item.name}» حذف شود؟`)) return;

    const response = await fetch(`/api/admin/reviews/${item.id}`, { method: "DELETE" });
    if (!response.ok) {
      const data = await response.json();
      alert(data.message ?? "حذف ناموفق بود.");
      return;
    }

    setReviews((current) => current.filter((review) => review.id !== item.id));
  }

  return (
    <div className="mt-8 overflow-x-auto">
      <table className="w-full text-right text-sm">
        <thead>
          <tr className="border-b border-zinc-200 text-zinc-500 dark:border-zinc-800">
            <th className="py-2 font-medium">نام</th>
            <th className="py-2 font-medium">امتیاز</th>
            <th className="py-2 font-medium">متن نظر</th>
            <th className="py-2 font-medium">IP</th>
            <th className="py-2 font-medium">وضعیت</th>
            <th className="py-2 font-medium">عملیات</th>
          </tr>
        </thead>
        <tbody>
          {reviews.length === 0 && (
            <tr>
              <td colSpan={6} className="py-6 text-center text-zinc-500">
                هیچ نظری ثبت نشده است.
              </td>
            </tr>
          )}
          {reviews.map((item) => (
            <tr key={item.id} className="border-b border-zinc-100 align-top dark:border-zinc-900">
              <td className="py-2 font-semibold whitespace-nowrap">{item.name}</td>
              <td className="py-2 whitespace-nowrap">{"★".repeat(item.rating)}</td>
              <td className="max-w-xs py-2">{item.comment}</td>
              <td className="py-2 whitespace-nowrap text-zinc-500" dir="ltr">
                {item.ip}
              </td>
              <td className="py-2">
                {item.approved ? (
                  <span className="text-emerald-600">تاییدشده</span>
                ) : (
                  <span className="text-amber-600">در انتظار تایید</span>
                )}
              </td>
              <td className="py-2">
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => toggleApproved(item)}
                    className="cursor-pointer text-sky-600 hover:underline"
                  >
                    {item.approved ? "لغو تایید" : "تایید"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item)}
                    className="cursor-pointer text-red-600 hover:underline"
                  >
                    حذف
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
