// One-off: lowercases and trims every user's email, so accounts created
// before emails were normalized can still log in (login now looks up the
// lowercased address). Dry run by default; pass --apply to write changes.
// Usage: npx tsx scripts/normalize-emails.ts [--apply]
// Reads .env.local, so it targets MONGODB_DB from there (the dev database)
// unless MONGODB_DB is already set in the shell.
process.loadEnvFile(".env.local");

import { connectToDatabase } from "../src/lib/db";
import { UserModel } from "../src/models/User";

async function main() {
  const apply = process.argv.includes("--apply");
  const connection = await connectToDatabase();
  console.log(`Database: ${connection.connection.name}${apply ? "" : " (dry run)"}`);

  // .lean() returns the raw stored values, before the schema's lowercase setter.
  const users = await UserModel.find({}, { email: 1 }).lean<{ _id: unknown; email: string }[]>();
  const normalizedCounts = new Map<string, number>();
  for (const user of users) {
    const normalized = user.email.trim().toLowerCase();
    normalizedCounts.set(normalized, (normalizedCounts.get(normalized) ?? 0) + 1);
  }

  let changed = 0;
  let conflicts = 0;
  for (const user of users) {
    const normalized = user.email.trim().toLowerCase();
    if (normalized === user.email) continue;

    // Two accounts that differ only in case can't both keep their email;
    // those need a manual decision about which account to keep.
    if (normalizedCounts.get(normalized)! > 1) {
      console.warn(`CONFLICT: "${user.email}" collides with another account as "${normalized}"`);
      conflicts++;
      continue;
    }

    console.log(`"${user.email}" -> "${normalized}"`);
    if (apply) await UserModel.updateOne({ _id: user._id }, { email: normalized });
    changed++;
  }

  console.log(
    `${users.length} users, ${changed} ${apply ? "updated" : "to update"}, ${conflicts} conflicts.`
  );
  process.exit(conflicts > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error("Failed:", error);
  process.exit(1);
});
