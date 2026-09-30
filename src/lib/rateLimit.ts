import { randomUUID } from "crypto";
import { cookies } from "next/headers";

const VISITOR_COOKIE = "sk_visitor";
const VISITOR_COOKIE_TTL_SECONDS = 60 * 60 * 24 * 365;

export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  return forwardedFor?.split(",")[0]?.trim() || "unknown";
}

// `ip` alone is read from a client-controllable header (see getClientIp) and
// can be spoofed per-request unless a trusted reverse proxy sanitizes it, so
// it's not sufficient on its own to stop scripted spam. `deviceId` is a
// random id stored in a cookie on the visitor's browser, shared across every
// public form on the site: a normal browser carries it automatically across
// requests, so this catches repeat submissions even when the IP is being
// spoofed. Neither signal is perfect alone; combining them raises the bar
// for casual abuse.
export async function getOrSetDeviceId(): Promise<string> {
  const store = await cookies();
  const existing = store.get(VISITOR_COOKIE)?.value;
  if (existing) return existing;

  const deviceId = randomUUID();
  store.set(VISITOR_COOKIE, deviceId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: VISITOR_COOKIE_TTL_SECONDS,
  });
  return deviceId;
}

interface RateLimitableModel {
  countDocuments(filter: Record<string, unknown>): Promise<number>;
}

interface RateLimitOptions {
  ip: string;
  deviceId: string;
  windowMs: number;
  max: number;
}

export async function isRateLimited(
  model: RateLimitableModel,
  { ip, deviceId, windowMs, max }: RateLimitOptions
): Promise<boolean> {
  const windowStart = new Date(Date.now() - windowMs);
  const [recentByIp, recentByDevice] = await Promise.all([
    model.countDocuments({ ip, createdAt: { $gte: windowStart } }),
    model.countDocuments({ deviceId, createdAt: { $gte: windowStart } }),
  ]);
  return recentByIp >= max || recentByDevice >= max;
}
