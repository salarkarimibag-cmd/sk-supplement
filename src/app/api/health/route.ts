import { connectToDatabase } from "@/lib/db";

// For an outside uptime monitor. It asks the database too, because cached
// pages keep answering while the shop itself can't work; if the whole site
// is down, nothing here runs at all, which is why the check must come from
// outside.
export async function GET() {
  try {
    const { connection } = await connectToDatabase();
    await connection.db?.command({ ping: 1 });
    return Response.json({ ok: true });
  } catch (error) {
    console.error("Health check failed:", error);
    return Response.json({ message: "سرویس در دسترس نیست." }, { status: 503 });
  }
}
