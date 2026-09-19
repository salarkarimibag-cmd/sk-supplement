import mongoose from "mongoose";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Next.js reloads route modules on every request in dev and can run many
// serverless invocations in prod, so the connection is cached on `global`
// to avoid opening a new MongoDB connection each time this module loads.
declare global {
  // eslint-disable-next-line no-var
  var _mongoose: MongooseCache | undefined;
}

const cached: MongooseCache = global._mongoose ?? { conn: null, promise: null };
global._mongoose = cached;

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      throw new Error("MONGODB_URI is not set. Add it to .env.local (see .env.example).");
    }
    cached.promise = mongoose.connect(MONGODB_URI, { dbName: "sk-supplement" });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
