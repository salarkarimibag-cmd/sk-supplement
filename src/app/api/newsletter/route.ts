import { connectToDatabase } from "@/lib/db";
import { SubscriberModel } from "@/models/Subscriber";

interface NewsletterBody {
  email?: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  const body: NewsletterBody = await request.json();
  const email = body.email?.trim().toLowerCase();

  if (!email || !EMAIL_PATTERN.test(email)) {
    return Response.json({ message: "ایمیل نامعتبر است." }, { status: 400 });
  }

  await connectToDatabase();

  // Upsert instead of create: re-submitting an already-subscribed email
  // should succeed quietly rather than fail on the unique index.
  await SubscriberModel.findOneAndUpdate(
    { email },
    { email },
    { upsert: true, setDefaultsOnInsert: true }
  );

  return Response.json({ message: "عضویت شما در خبرنامه با موفقیت ثبت شد." });
}
