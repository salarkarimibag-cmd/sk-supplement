// Loads a folder written by backup-db.ts into a database, with its indexes.
// It only fills an empty database, so it can never overwrite live data: to
// replace one, restore into a new name and point MONGODB_DB at that.
// Usage: npm run restore-db -- backups/sk-supplement-2026-11-04T09-30-00 <target database>
process.loadEnvFile(".env.local");

import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import mongoose from "mongoose";

const { EJSON } = mongoose.mongo.BSON;

/** Few enough documents per insert to stay under MongoDB's message size. */
const BATCH_SIZE = 500;

type IndexDescription = { name: string; key: Record<string, mongoose.mongo.IndexDirection> } & Record<string, unknown>;

async function main() {
  const [folder, dbName] = process.argv.slice(2);
  if (!folder || !dbName) {
    throw new Error("Usage: npm run restore-db -- <backup folder> <target database>");
  }
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set in .env.local.");

  await mongoose.connect(uri, { dbName });
  const db = mongoose.connection.db!;

  const existing = await db.listCollections({}, { nameOnly: true }).toArray();
  if (existing.length > 0) {
    throw new Error(`"${dbName}" already has collections; restore only into a new, empty database.`);
  }

  const indexes: Record<string, IndexDescription[]> = JSON.parse(
    readFileSync(path.join(folder, "indexes.json"), "utf8")
  );
  const files = readdirSync(folder).filter((file) => file.endsWith(".json") && file !== "indexes.json");

  let total = 0;
  for (const file of files) {
    const name = file.slice(0, -".json".length);
    const documents = EJSON.parse(readFileSync(path.join(folder, file), "utf8"), { relaxed: false }) as Record<
      string,
      unknown
    >[];
    // Created even when empty, so its indexes (a unique email, say) exist too.
    const collection = await db.createCollection(name);
    for (let start = 0; start < documents.length; start += BATCH_SIZE) {
      await collection.insertMany(documents.slice(start, start + BATCH_SIZE), { ordered: true });
    }
    // _id_ comes with every collection; "v" and "ns" describe the old one.
    for (const { key, name: indexName, ...rest } of indexes[name] ?? []) {
      if (indexName === "_id_") continue;
      const options = Object.fromEntries(Object.entries(rest).filter(([option]) => option !== "v" && option !== "ns"));
      await collection.createIndex(key, { name: indexName, ...options });
    }
    total += documents.length;
    console.log(`${name}: ${documents.length}`);
  }

  console.log(`\n${total} documents restored into "${dbName}"`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
