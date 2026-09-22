"use client";

import { useState } from "react";

interface DiscountCodeItem {
  id: string;
  code: string;
  type: "percent" | "fixed";
  value: number;
  active: boolean;
  expiresAt: string | null;
}

interface FormState {
  code: string;
  type: "percent" | "fixed";
  value: string;
  active: boolean;
  expiresAt: string;
}

const emptyForm: FormState = { code: "", type: "percent", value: "", active: true, expiresAt: "" };

const inputClass =
  "w-full rounded border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-sky-600 dark:border-zinc-700 dark:bg-zinc-900";

export default function DiscountManager({ initialCodes }: { initialCodes: DiscountCodeItem[] }) {
  const [codes, setCodes] = useState(initialCodes);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function startEdit(item: DiscountCodeItem) {
    setEditingId(item.id);
    setForm({
      code: item.code,
      type: item.type,
      value: String(item.value),
      active: item.active,
      expiresAt: item.expiresAt ? item.expiresAt.slice(0, 10) : "",
    });
    setError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
    setError(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!form.code.trim() || !form.value || Number(form.value) <= 0) {
      setError("کد و مقدار الزامی هستند.");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      code: form.code.trim(),
      type: form.type,
      value: Number(form.value),
      active: form.active,
      expiresAt: form.expiresAt || null,
    };

    try {
      const response = await fetch(
        editingId ? `/api/admin/discounts/${editingId}` : "/api/admin/discounts",
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await response.json();

      if (!response.ok) {
        setError(data.message ?? "عملیات ناموفق بود.");
        return;
      }

      const saved: DiscountCodeItem = {
        id: editingId ?? data._id,
        code: data.code,
        type: data.type,
        value: data.value,
        active: data.active,
        expiresAt: data.expiresAt ?? null,
      };

      setCodes((current) =>
        editingId
          ? current.map((item) => (item.id === editingId ? saved : item))
          : [saved, ...current]
      );
      cancelEdit();
    } catch {
      setError("خطایی رخ داد. دوباره تلاش کنید.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(item: DiscountCodeItem) {
    if (!confirm(`کد «${item.code}» حذف شود؟`)) return;

    const response = await fetch(`/api/admin/discounts/${item.id}`, { method: "DELETE" });
    if (!response.ok) {
      const data = await response.json();
      alert(data.message ?? "حذف ناموفق بود.");
      return;
    }

    setCodes((current) => current.filter((code) => code.id !== item.id));
    if (editingId === item.id) cancelEdit();
  }

  return (
    <div className="mt-8">
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-2 gap-3 rounded border border-zinc-200 p-4 dark:border-zinc-800 sm:grid-cols-5"
      >
        <input
          type="text"
          placeholder="کد (مثلاً WELCOME10)"
          value={form.code}
          onChange={(event) => setForm({ ...form, code: event.target.value })}
          className={`col-span-2 ${inputClass}`}
        />
        <select
          value={form.type}
          onChange={(event) =>
            setForm({ ...form, type: event.target.value as FormState["type"] })
          }
          className={inputClass}
        >
          <option value="percent">درصدی</option>
          <option value="fixed">مبلغ ثابت</option>
        </select>
        <input
          type="number"
          min={1}
          placeholder={form.type === "percent" ? "درصد" : "مبلغ (تومان)"}
          value={form.value}
          onChange={(event) => setForm({ ...form, value: event.target.value })}
          className={inputClass}
        />
        <input
          type="date"
          value={form.expiresAt}
          onChange={(event) => setForm({ ...form, expiresAt: event.target.value })}
          className={inputClass}
        />

        <label className="col-span-2 flex items-center gap-2 text-sm sm:col-span-1">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(event) => setForm({ ...form, active: event.target.checked })}
          />
          فعال
        </label>

        <div className="col-span-2 flex gap-2 sm:col-span-4 sm:justify-end">
          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="cursor-pointer rounded border border-zinc-300 px-4 py-2 text-sm font-semibold dark:border-zinc-700"
            >
              لغو
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="cursor-pointer rounded bg-sky-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {editingId ? "ذخیره تغییرات" : "ساخت کد جدید"}
          </button>
        </div>

        {error && <p className="col-span-2 text-sm text-red-600 sm:col-span-5">{error}</p>}
      </form>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-right text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-zinc-500 dark:border-zinc-800">
              <th className="py-2 font-medium">کد</th>
              <th className="py-2 font-medium">نوع</th>
              <th className="py-2 font-medium">مقدار</th>
              <th className="py-2 font-medium">وضعیت</th>
              <th className="py-2 font-medium">انقضا</th>
              <th className="py-2 font-medium">عملیات</th>
            </tr>
          </thead>
          <tbody>
            {codes.length === 0 && (
              <tr>
                <td colSpan={6} className="py-6 text-center text-zinc-500">
                  هیچ کد تخفیفی ثبت نشده است.
                </td>
              </tr>
            )}
            {codes.map((item) => (
              <tr key={item.id} className="border-b border-zinc-100 dark:border-zinc-900">
                <td className="py-2 font-semibold">{item.code}</td>
                <td className="py-2">{item.type === "percent" ? "درصدی" : "مبلغ ثابت"}</td>
                <td className="py-2">
                  {item.type === "percent" ? `${item.value}%` : `${item.value.toLocaleString("fa-IR")} تومان`}
                </td>
                <td className="py-2">
                  {item.active ? (
                    <span className="text-emerald-600">فعال</span>
                  ) : (
                    <span className="text-zinc-400">غیرفعال</span>
                  )}
                </td>
                <td className="py-2">
                  {item.expiresAt ? new Date(item.expiresAt).toLocaleDateString("fa-IR") : "—"}
                </td>
                <td className="py-2">
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => startEdit(item)}
                      className="cursor-pointer text-sky-600 hover:underline"
                    >
                      ویرایش
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
    </div>
  );
}
