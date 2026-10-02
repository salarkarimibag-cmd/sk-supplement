import { describe, expect, it } from "vitest";
import { getClientIp } from "./rateLimit";

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
