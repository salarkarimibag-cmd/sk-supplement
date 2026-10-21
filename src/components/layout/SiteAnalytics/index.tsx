"use client";

import { Analytics, type BeforeSend } from "@vercel/analytics/next";
import { sanitizeAnalyticsUrl } from "@/lib/analytics";

const beforeSend: BeforeSend = (event) => {
  const url = sanitizeAnalyticsUrl(event.url);
  return url ? { ...event, url } : null;
};

// A Client Component of its own because `beforeSend` is a function, and a
// Server Component (the root layout) can't pass functions to client code.
export default function SiteAnalytics() {
  return <Analytics beforeSend={beforeSend} />;
}
