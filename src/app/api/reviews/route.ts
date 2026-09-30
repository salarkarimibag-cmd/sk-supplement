import { randomUUID } from "crypto";
import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/db";
import { ReviewModel } from "@/models/Review";

interface ReviewBody {
  name?: string;
  rating?: number;
  comment?: string;
}

const RATE_LIMIT_WINDOW_MS = 24 * 60 * 60 * 1000;
const RATE_LIMIT_MAX = 3;
const DEVICE_COOKIE = "review_device";
const DEVICE_COOKIE_TTL_SECONDS = 60 * 60 * 24 * 365;

function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  return forwardedFor?.split(",")[0]?.trim() || "unknown";
}

// `ip` alone is read from a client-controllable header (see getClientIp) and
// can be spoofed per-request unless a trusted reverse proxy sanitizes it, so
// it's not sufficient on its own to stop scripted spam. `deviceId` is a
// random id stored in a cookie on the visitor's browser: a normal browser
// carries it automatically across requests, so this catches repeat
// submissions even when the IP is being spoofed. Neither signal is perfect
// alone; combining them raises the bar for casual abuse.
async function getOrSetDeviceId(): Promise<string> {
  const store = await cookies();
  const existing = store.get(DEVICE_COOKIE)?.value;
  if (existing) return existing;

  const deviceId = randomUUID();
  store.set(DEVICE_COOKIE, deviceId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: DEVICE_COOKIE_TTL_SECONDS,
  });
  return deviceId;
}

export async function POST(request: Request) {
  const body: ReviewBody = await request.json();
  const name = body.name?.trim();
  const rating = body.rating;
  const comment = body.comment?.trim();

  if (
    !name ||
    name.length > 100 ||
    !comment ||
    comment.length > 1000 ||
    typeof rating !== "number" ||
    !Number.isInteger(rating) ||
    rating < 1 ||
    rating > 5
  ) {
    return Response.json(
      { message: "نام، امتیاز (بین ۱ تا ۵) و متن نظر الزامی هستند." },
      { status: 400 }
    );
  }

  const ip = getClientIp(request);
  const deviceId = await getOrSetDeviceId();

  await connectToDatabase();

  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS);
  const [recentByIp, recentByDevice] = await Promise.all([
    ReviewModel.countDocuments({ ip, createdAt: { $gte: windowStart } }),
    ReviewModel.countDocuments({ deviceId, createdAt: { $gte: windowStart } }),
  ]);

  if (recentByIp >= RATE_LIMIT_MAX || recentByDevice >= RATE_LIMIT_MAX) {
    return Response.json(
      { message: "شما به تازگی نظر ثبت کرده‌اید. لطفاً بعداً دوباره تلاش کنید." },
      { status: 429 }
    );
  }

  await ReviewModel.create({ name, rating, comment, approved: false, ip, deviceId });

  return Response.json({
    message: "نظر شما با موفقیت ثبت شد و پس از تایید مدیر نمایش داده می‌شود.",
  });
}
