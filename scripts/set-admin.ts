// One-off: promotes an already-registered user to admin so they can reach
// /admin/discounts. Usage: npx tsx scripts/set-admin.ts you@example.com
process.loadEnvFile(".env.local");

import { connectToDatabase } from "../src/lib/db";
import { UserModel } from "../src/models/User";

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Usage: npx tsx scripts/set-admin.ts <email>");
    process.exit(1);
  }

  await connectToDatabase();

  const user = await UserModel.findOneAndUpdate(
    { email },
    { isAdmin: true },
    { returnDocument: "after" }
  );

  if (!user) {
    console.error(`No user found with email "${email}". Register that account first.`);
    process.exit(1);
  }

  console.log(`${user.email} is now an admin.`);
  process.exit(0);
}

main().catch((error) => {
  console.error("Failed:", error);
  process.exit(1);
});
