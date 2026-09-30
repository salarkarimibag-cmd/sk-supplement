import { connectToDatabase } from "@/lib/db";
import { ReviewModel } from "@/models/Review";
import { getClientIp, getOrSetDeviceId, isRateLimited } from "@/lib/rateLimit";

interface ReviewBody {
  name?: string;
  rating?: number;
  comment?: string;
}

const RATE_LIMIT_WINDOW_MS = 24 * 60 * 60 * 1000;
const RATE_LIMIT_MAX = 3;

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

  const limited = await isRateLimited(ReviewModel, {
    ip,
    deviceId,
    windowMs: RATE_LIMIT_WINDOW_MS,
    max: RATE_LIMIT_MAX,
  });

  if (limited) {
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
