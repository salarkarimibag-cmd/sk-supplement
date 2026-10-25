import { describe, expect, it } from "vitest";
import { getClientIp, isRateLimited } from "./rateLimit";

// A stand-in for a Mongoose model: counts its records matching the filter's
// ip or deviceId, created at or after the filter's createdAt.$gte.
function fakeModel(records: { ip: string; deviceId: string; createdAt: Date }[]) {
  return {
    async countDocuments(filter: Record<string, unknown>) {
      const since = (filter.createdAt as { $gte: Date }).$gte;
      return records.filter(
        (record) =>
          record.createdAt >= since &&
          (("ip" in filter && record.ip === filter.ip) ||
            ("deviceId" in filter && record.deviceId === filter.deviceId))
      ).length;
    },
  };
}

describe("isRateLimited", () => {
  const now = new Date();
  const recent = (ip: string, deviceId: string) => ({ ip, deviceId, createdAt: now });
  const options = { ip: "1.1.1.1", deviceId: "device-a", windowMs: 60_000, max: 2 };

  it("allows a visitor below the limit", async () => {
    const model = fakeModel([recent("1.1.1.1", "device-a")]);
    expect(await isRateLimited(model, options)).toBe(false);
  });

  it("limits by ip even when the device cookie changes", async () => {
    const model = fakeModel([recent("1.1.1.1", "device-x"), recent("1.1.1.1", "device-y")]);
    expect(await isRateLimited(model, options)).toBe(true);
  });

  it("limits by device even when the ip changes", async () => {
    const model = fakeModel([recent("9.9.9.1", "device-a"), recent("9.9.9.2", "device-a")]);
    expect(await isRateLimited(model, options)).toBe(true);
  });

  it("ignores records older than the window", async () => {
    const old = new Date(now.getTime() - 120_000);
    const model = fakeModel([
      { ip: "1.1.1.1", deviceId: "device-a", createdAt: old },
      { ip: "1.1.1.1", deviceId: "device-a", createdAt: old },
    ]);
    expect(await isRateLimited(model, options)).toBe(false);
  });
});

function requestWithHeader(value: string | null): Request {
  const headers = new Headers();
  if (value !== null) headers.set("x-forwarded-for", value);
  return new Request("http://localhost/api/test", { headers });
}

describe("getClientIp", () => {
  it("returns the first IP in a comma-separated chain", () => {
    expect(getClientIp(requestWithHeader("1.2.3.4, 5.6.7.8"))).toBe("1.2.3.4");
  });

  it("trims whitespace around the IP", () => {
    expect(getClientIp(requestWithHeader("  1.2.3.4  , 5.6.7.8"))).toBe("1.2.3.4");
  });

  it("returns a single IP unchanged", () => {
    expect(getClientIp(requestWithHeader("9.9.9.9"))).toBe("9.9.9.9");
  });

  it("falls back to \"unknown\" when the header is missing", () => {
    expect(getClientIp(requestWithHeader(null))).toBe("unknown");
  });
});
