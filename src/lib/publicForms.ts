import { z } from "zod";

// Length limits for the public forms, shared by the API schemas below and the
// form fields (maxLength), so a visitor can't type more than the server takes.
export const CONTACT_NAME_MAX_LENGTH = 100;
export const CONTACT_MESSAGE_MAX_LENGTH = 2000;
// The longest an email address can be (RFC 5321).
export const EMAIL_MAX_LENGTH = 254;

// z.string() first, so a non-string value (a number, or an object such as
// {"$ne": null}) is a validation error instead of crashing .trim() or
// reaching a MongoDB query as an operator.
const emailSchema = z.string().trim().toLowerCase().max(EMAIL_MAX_LENGTH).pipe(z.email());

export const contactMessageSchema = z.object({
  name: z.string().trim().min(1).max(CONTACT_NAME_MAX_LENGTH),
  email: emailSchema,
  message: z.string().trim().min(1).max(CONTACT_MESSAGE_MAX_LENGTH),
});

export const newsletterSchema = z.object({
  email: emailSchema,
});
