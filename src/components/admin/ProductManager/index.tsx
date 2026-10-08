"use client";

import { useState } from "react";

interface ProductItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  categorySlug: string;
  imageUrl: string;
  stock: number;
  rating: number;
  reviewCount: number;
  flavor: string;
  size: string;
}

interface CategoryOption {
  slug: string;
  title: string;
}

interface FormState {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: string;
  categorySlug: string;
  imageUrl: string;
  stock: string;
  rating: string;
  reviewCount: string;
  flavor: string;
  size: string;
}

function emptyForm(defaultCategorySlug: string): FormState {
  return {
    id: "",
    name: "",
    slug: "",
    description: "",
    price: "",
    categorySlug: defaultCategorySlug,
    imageUrl: "",
    stock: "",
    rating: "",
    reviewCount: "",
    flavor: "",
    size: "",
  };
}

const inputClass =
  "w-full rounded border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-sky-600 dark:border-zinc-700 dark:bg-zinc-900";

export default function ProductManager({
  initialProducts,
  categoryOptions,
}: {
  initialProducts: ProductItem[];
  categoryOptions: CategoryOption[];
}) {
  const defaultCategorySlug = categoryOptions[0]?.slug ?? "";
  const [products, setProducts] = useState(initialProducts);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm(defaultCategorySlug));
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function startEdit(item: ProductItem) {
    setEditingId(item.id);
    setForm({
      id: item.id,
      name: item.name,
      slug: item.slug,
      description: item.description,
      price: String(item.price),
      categorySlug: item.categorySlug,
      imageUrl: item.imageUrl,
      stock: String(item.stock),
      rating: String(item.rating),
      reviewCount: String(item.reviewCount),
      flavor: item.flavor,
      size: item.size,
    });
    setError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm(defaultCategorySlug));
    setError(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (
      (!editingId && !form.id.trim()) ||
      !form.name.trim() ||
      !form.slug.trim() ||
      !form.price ||
      Number(form.price) <= 0 ||
      !form.categorySlug ||
      !form.imageUrl.trim() ||
      !form.stock
    ) {
      setError("شناسه، نام، اسلاگ، قیمت، دسته‌بندی، تصویر و موجودی الزامی هستند.");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      id: form.id.trim(),
      name: form.name.trim(),
      slug: form.slug.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      categorySlug: form.categorySlug,
      imageUrl: form.imageUrl.trim(),
      stock: Number(form.stock),
      rating: form.rating ? Number(form.rating) : 0,
      reviewCount: form.reviewCount ? Number(form.reviewCount) : 0,
      flavor: form.flavor.trim(),
      size: form.size.trim(),
    };

    try {
      const response = await fetch(
        editingId ? `/api/admin/products/${editingId}` : "/api/admin/products",
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

      const saved: ProductItem = {
        id: data.id,
        name: data.name,
        slug: data.slug,
        description: data.description,
        price: data.price,
        categorySlug: data.categorySlug,
        imageUrl: data.imageUrl,
        stock: data.stock,
        rating: data.rating,
        reviewCount: data.reviewCount,
        flavor: data.flavor ?? "",
        size: data.size ?? "",
      };

      setProducts((current) =>
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

  async function handleDelete(item: ProductItem) {
    if (!confirm(`محصول «${item.name}» حذف شود؟`)) return;

    const response = await fetch(`/api/admin/products/${item.id}`, { method: "DELETE" });
    if (!response.ok) {
      const data = await response.json();
      alert(data.message ?? "حذف ناموفق بود.");
      return;
    }

    setProducts((current) => current.filter((product) => product.id !== item.id));
    if (editingId === item.id) cancelEdit();
  }

  return (
    <div className="mt-8">
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-2 gap-3 rounded border border-zinc-200 p-4 dark:border-zinc-800 sm:grid-cols-4"
      >
        <input
          type="text"
          placeholder="شناسه (مثلاً p5)"
          value={form.id}
          disabled={!!editingId}
          onChange={(event) => setForm({ ...form, id: event.target.value })}
          className={`${inputClass} disabled:cursor-not-allowed disabled:opacity-60`}
        />
        <input
          type="text"
          placeholder="نام محصول"
          value={form.name}
          onChange={(event) => setForm({ ...form, name: event.target.value })}
          className={inputClass}
        />
        <input
          type="text"
          placeholder="اسلاگ (whey-protein-isolate)"
          value={form.slug}
          onChange={(event) => setForm({ ...form, slug: event.target.value })}
          className={inputClass}
        />
        <select
          value={form.categorySlug}
          onChange={(event) => setForm({ ...form, categorySlug: event.target.value })}
          className={inputClass}
        >
          {categoryOptions.map((category) => (
            <option key={category.slug} value={category.slug}>
              {category.title}
            </option>
          ))}
        </select>

        <input
          type="number"
          min={1}
          placeholder="قیمت (تومان)"
          value={form.price}
          onChange={(event) => setForm({ ...form, price: event.target.value })}
          className={inputClass}
        />
        <input
          type="number"
          min={0}
          placeholder="موجودی"
          value={form.stock}
          onChange={(event) => setForm({ ...form, stock: event.target.value })}
          className={inputClass}
        />
        <input
          type="text"
          placeholder="طعم (اختیاری)"
          value={form.flavor}
          onChange={(event) => setForm({ ...form, flavor: event.target.value })}
          className={inputClass}
        />
        <input
          type="text"
          placeholder="سایز (اختیاری)"
          value={form.size}
          onChange={(event) => setForm({ ...form, size: event.target.value })}
          className={inputClass}
        />

        <input
          type="text"
          placeholder="مسیر تصویر (/images/product.webp)"
          value={form.imageUrl}
          onChange={(event) => setForm({ ...form, imageUrl: event.target.value })}
          className={`col-span-2 ${inputClass}`}
        />
        <input
          type="number"
          min={0}
          max={5}
          step={0.1}
          placeholder="امتیاز (اختیاری)"
          value={form.rating}
          onChange={(event) => setForm({ ...form, rating: event.target.value })}
          className={inputClass}
        />
        <input
          type="number"
          min={0}
          placeholder="تعداد نظرات (اختیاری)"
          value={form.reviewCount}
          onChange={(event) => setForm({ ...form, reviewCount: event.target.value })}
          className={inputClass}
        />

        <textarea
          placeholder="توضیحات"
          value={form.description}
          onChange={(event) => setForm({ ...form, description: event.target.value })}
          rows={4}
          className={`col-span-2 sm:col-span-4 ${inputClass}`}
        />

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
            {editingId ? "ذخیره تغییرات" : "ساخت محصول جدید"}
          </button>
        </div>

        {error && <p className="col-span-2 text-sm text-red-600 sm:col-span-4">{error}</p>}
      </form>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-right text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-zinc-500 dark:border-zinc-800">
              <th className="py-2 font-medium">نام</th>
              <th className="py-2 font-medium">دسته‌بندی</th>
              <th className="py-2 font-medium">قیمت</th>
              <th className="py-2 font-medium">موجودی</th>
              <th className="py-2 font-medium">عملیات</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 && (
              <tr>
                <td colSpan={5} className="py-6 text-center text-zinc-500">
                  هیچ محصولی ثبت نشده است.
                </td>
              </tr>
            )}
            {products.map((item) => (
              <tr key={item.id} className="border-b border-zinc-100 dark:border-zinc-900">
                <td className="py-2 font-semibold">{item.name}</td>
                <td className="py-2">
                  {categoryOptions.find((category) => category.slug === item.categorySlug)
                    ?.title ?? item.categorySlug}
                </td>
                <td className="py-2">{item.price.toLocaleString("fa-IR")} تومان</td>
                <td className="py-2">
                  {item.stock > 0 ? (
                    item.stock
                  ) : (
                    <span className="text-red-500">ناموجود</span>
                  )}
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
