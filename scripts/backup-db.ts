// Copies a whole database into backups/<database>-<date>/: one Extended JSON
// file per collection (so ObjectIds and dates keep their types) and
// indexes.json, which restore-db.ts reads to rebuild it anywhere.
// Usage: npm run backup-db                    (MONGODB_DB from .env.local, the dev database)
//        npm run backup-db -- sk-supplement   (production)
// The files hold customers' details and password hashes: backups/ is
// git-ignored, and a copy kept elsewhere should stay private too.
// The nightly GitHub Action (.github/workflows/backup.yml) has no .env.local:
// it passes MONGODB_URI as an environment variable instead.
import { existsSync, mkdirSync, writeFileSync } from "node:fs";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");
import path from "node:path";
import mongoose from "mongoose";

const { EJSON } = mongoose.mongo.BSON;

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set in .env.local.");
  const dbName = process.argv[2] ?? process.env.MONGODB_DB ?? "sk-supplement";

  await mongoose.connect(uri, { dbName });
  const db = mongoose.connection.db!;

  // 2026-11-04T09-30-00: sorts by date, and Windows allows no ":" in names.
  const stamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-");
  const folder = path.join("backups", `${dbName}-${stamp}`);
  mkdirSync(folder, { recursive: true });

  const collections = (await db.listCollections({}, { nameOnly: true }).toArray())
    .map((collection) => collection.name)
    .filter((name) => !name.startsWith("system."))
    .sort();

  const indexes: Record<string, unknown[]> = {};
  let total = 0;
  for (const name of collections) {
    const documents = await db.collection(name).find().toArray();
    // relaxed: false writes every type explicitly ({"$oid": …}, {"$date": …}),
    // so nothing comes back as a plain string or a different kind of number.
    writeFileSync(path.join(folder, `${name}.json`), EJSON.stringify(documents, undefined, 0, { relaxed: false }));
    indexes[name] = await db.collection(name).indexes();
    total += documents.length;
    console.log(`${name}: ${documents.length}`);
  }
  writeFileSync(path.join(folder, "indexes.json"), JSON.stringify(indexes, null, 2));

  console.log(`\n${total} documents from "${dbName}" saved to ${folder}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
