import { getSessionUser } from "@/lib/auth";

// Who is logged in, for the header's account icon. The root layout doesn't
// read the session cookie, so pages can be prerendered once for everyone;
// the browser asks for this after the page loads instead (useSessionUser).
// Only what the header shows.
export async function GET() {
  const user = await getSessionUser();
  return Response.json(
    { user: user ? { id: user.id, fullName: user.fullName } : null },
    // Per visitor: no shared cache may keep one person's answer for another.
    { headers: { "Cache-Control": "private, no-store" } }
  );
}
