import { z } from "zod";

// Lowercase words joined by hyphens, like "on-gold-standard-whey": both
// appear in URLs, so nothing that would need escaping there.
const slugPattern = /^[a-z0-9]+(-[a-z0-9]+)*$/;

// The main fields of a product; brand, label details and group have their
// own schemas (productDetailsSchema, productGroupSchema). Each is checked as
// a string or number first, so a wrong type is a validation error (400),
// not a crash or a Mongoose cast error (500).
const productFieldsSchema = z.object({
  name: z.string().trim().min(1).max(200),
  slug: z.string().trim().max(100).regex(slugPattern),
  description: z.string().trim().max(5000),
  // Prices are whole Toman.
  price: z.number().int().positive(),
  categorySlug: z.string().trim().min(1).max(100),
  // A path under public/: <Image> only accepts local paths here (no remote
  // hosts are configured), and any other value breaks every page that shows
  // the product.
  imageUrl: z.string().trim().max(500).regex(/^\/\S+$/),
  stock: z.number().int().min(0),
  // "" clears the field.
  flavor: z.string().trim().max(60),
  size: z.string().trim().max(60),
});

/** What an admin sends to create a product. */
export const productCreateSchema = productFieldsSchema.extend({
  id: z.string().trim().max(100).regex(slugPattern),
  description: productFieldsSchema.shape.description.optional(),
  flavor: productFieldsSchema.shape.flavor.optional(),
  size: productFieldsSchema.shape.size.optional(),
});

/**
 * What an admin sends to edit a product: any subset of the fields; the ones
 * left out keep their saved values. A product's `id` can't change (orders
 * and reviews point at it), so it isn't part of an edit and is ignored if sent.
 */
export const productUpdateSchema = productFieldsSchema.partial();

const FIELD_MESSAGES: Record<string, string> = {
  id: "شناسه باید با حروف انگلیسی کوچک، عدد و خط تیره باشد (مثلاً on-whey-2lb).",
  slug: "اسلاگ باید با حروف انگلیسی کوچک، عدد و خط تیره باشد (مثلاً on-gold-standard-whey).",
  name: "نام الزامی است و حداکثر ۲۰۰ حرف.",
  description: "توضیحات حداکثر ۵٬۰۰۰ حرف است.",
  price: "قیمت باید عددی صحیح و بیشتر از صفر (به تومان) باشد.",
  categorySlug: "دسته‌بندی را انتخاب کنید.",
  imageUrl: "آدرس تصویر باید با / شروع شود (مثلاً /images/products/on-whey.webp).",
  stock: "موجودی باید عددی صحیح و صفر یا بیشتر باشد.",
  flavor: "طعم حداکثر ۶۰ حرف است.",
  size: "سایز حداکثر ۶۰ حرف است.",
};

/** A Persian message naming the first invalid field of a failed product parse. */
export function productInputErrorMessage(error: z.ZodError): string {
  const field = error.issues[0]?.path[0];
  return (field !== undefined && FIELD_MESSAGES[String(field)]) || "اطلاعات محصول نامعتبر است.";
}
