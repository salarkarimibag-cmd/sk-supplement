import { beforeEach, describe, expect, it, vi } from "vitest";

// A stand-in for mongoose.connect, so no real database is needed.
const connect = vi.fn();
vi.mock("mongoose", () => ({ default: { connect } }));

const { connectToDatabase } = await import("./db");

describe("connectToDatabase", () => {
  beforeEach(() => {
    connect.mockReset();
    globalThis._mongoose!.conn = null;
    globalThis._mongoose!.promise = null;
    process.env.MONGODB_URI = "mongodb://test";
  });

  it("connects once and reuses the cached connection", async () => {
    connect.mockResolvedValue("connection");

    await connectToDatabase();
    await connectToDatabase();

    expect(connect).toHaveBeenCalledTimes(1);
  });

  it("retries on the next call after a failed connection", async () => {
    connect.mockRejectedValueOnce(new Error("network down")).mockResolvedValueOnce("connection");

    await expect(connectToDatabase()).rejects.toThrow("network down");
    await expect(connectToDatabase()).resolves.toBe("connection");
    expect(connect).toHaveBeenCalledTimes(2);
  });
});
