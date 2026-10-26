"use client";

import { useState } from "react";
import {
  formatNutritionFacts,
  parseNutritionFacts,
  type NutritionFact,
} from "@/lib/productDetails";

interface ProductItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  categorySlug: string;
  imageUrl: string;
  brand: string;
  stock: number;
  flavor: string;
  size: string;
  groupSlug: string;
  servingSize: string;
  nutritionFacts: NutritionFact[];
  usage: string;
  warnings: string;
  manufacturerClaims: string;
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
  brand: string;
  stock: string;
  flavor: string;
  size: string;
  groupSlug: string;
  servingSize: string;
  /** One "label: amount" per line; see parseNutritionFacts. */
  nutritionFacts: string;
  usage: string;
  warnings: string;
  manufacturerClaims: string;
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
    brand: "",
    stock: "",
    flavor: "",
    size: "",
    groupSlug: "",
    servingSize: "",
    nutritionFacts: "",
    usage: "",
    warnings: "",
    manufacturerClaims: "",
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
      brand: item.brand,
      stock: String(item.stock),
      flavor: item.flavor,
      size: item.size,
      groupSlug: item.groupSlug,
      servingSize: item.servingSize,
      nutritionFacts: formatNutritionFacts(item.nutritionFacts),
      usage: item.usage,
      warnings: item.warnings,
      manufacturerClaims: item.manufacturerClaims,
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

    const nutrition = parseNutritionFacts(form.nutritionFacts);
    if (nutrition.invalidLines.length > 0) {
      setError(
        `این خطوط ارزش غذایی باید به شکل «عنوان: مقدار» باشند: ${nutrition.invalidLines.join("، ")}`
      );
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
      brand: form.brand.trim(),
      stock: Number(form.stock),
      flavor: form.flavor.trim(),
      size: form.size.trim(),
      groupSlug: form.groupSlug.trim(),
      servingSize: form.servingSize.trim(),
      nutritionFacts: nutrition.facts,
      usage: form.usage.trim(),
      warnings: form.warnings.trim(),
      manufacturerClaims: form.manufacturerClaims.trim(),
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
        brand: data.brand ?? "",
        stock: data.stock,
        flavor: data.flavor ?? "",
        size: data.size ?? "",
        groupSlug: data.groupSlug ?? "",
        servingSize: data.servingSize ?? "",
        nutritionFacts: data.nutritionFacts ?? [],
        usage: data.usage ?? "",
        warnings: data.warnings ?? "",
        manufacturerClaims: data.manufacturerClaims ?? "",
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
          placeholder="برند (اختیاری)"
          value={form.brand}
          onChange={(event) => setForm({ ...form, brand: event.target.value })}
          className={`col-span-2 sm:col-span-1 ${inputClass}`}
        />
        <input
          type="text"
          placeholder="مسیر تصویر (/images/product.webp)"
          value={form.imageUrl}
          onChange={(event) => setForm({ ...form, imageUrl: event.target.value })}
          className={`col-span-2 sm:col-span-3 ${inputClass}`}
        />
        <input
          type="text"
          dir="ltr"
          placeholder="گروه طعم/سایز (اختیاری، مثلاً whey-isolate)"
          title="محصولاتی که گروه یکسان دارند، طعم‌ها و سایزهای یک محصول حساب می‌شوند."
          value={form.groupSlug}
          onChange={(event) => setForm({ ...form, groupSlug: event.target.value })}
          className={`col-span-2 sm:col-span-4 text-end placeholder:text-end ${inputClass}`}
        />

        <textarea
          placeholder="توضیحات"
          value={form.description}
          onChange={(event) => setForm({ ...form, description: event.target.value })}
          rows={4}
          className={`col-span-2 sm:col-span-4 ${inputClass}`}
        />

        <fieldset className="col-span-2 grid grid-cols-1 gap-3 sm:col-span-4 sm:grid-cols-2">
          <legend className="mb-1 text-sm font-semibold text-zinc-500">
            ارزش غذایی و روش مصرف (اختیاری)
          </legend>
          <input
            type="text"
            placeholder="هر وعده (مثلاً ۱ اسکوپ، ۳۳ گرم)"
            value={form.servingSize}
            onChange={(event) => setForm({ ...form, servingSize: event.target.value })}
            className={`sm:col-span-2 ${inputClass}`}
          />
          <textarea
            placeholder={"ارزش غذایی، هر خط یک مورد:\nپروتئین: ۲۵ گرم\nکالری: ۱۲۰"}
            value={form.nutritionFacts}
            onChange={(event) => setForm({ ...form, nutritionFacts: event.target.value })}
            rows={6}
            dir="rtl"
            className={inputClass}
          />
          <div className="grid gap-3">
            <textarea
              placeholder="روش مصرف"
              value={form.usage}
              onChange={(event) => setForm({ ...form, usage: event.target.value })}
              rows={3}
              className={inputClass}
            />
            <textarea
              placeholder="هشدارها"
              value={form.warnings}
              onChange={(event) => setForm({ ...form, warnings: event.target.value })}
              rows={3}
              className={inputClass}
            />
          </div>
          <textarea
            placeholder={"ادعاهای سازنده روی بسته، هر خط یک مورد:\nافزایش قدرت و حجم عضلات"}
            value={form.manufacturerClaims}
            onChange={(event) => setForm({ ...form, manufacturerClaims: event.target.value })}
            rows={3}
            className={`sm:col-span-2 ${inputClass}`}
          />
        </fieldset>

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
        {/* text-right, not text-start: start is the default, so th cells would center and dir="ltr" cells would go left. */}
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
