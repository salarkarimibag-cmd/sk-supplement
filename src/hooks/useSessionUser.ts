"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { HeaderUser } from "@/components/layout/Header";

/**
 * The logged-in user for the header, asked from /api/auth/session after the
 * page loads (pages are prerendered for everyone, so the HTML can't carry
 * it). Asked again on every navigation, which also covers logging in and
 * out: both end by moving to another page. Null until the answer arrives,
 * and while logged out.
 */
export function useSessionUser(): HeaderUser | null {
  const pathname = usePathname();
  const [user, setUser] = useState<HeaderUser | null>(null);

  useEffect(() => {
    // A newer navigation's request replaces this one.
    const controller = new AbortController();
    fetch("/api/auth/session", { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : { user: null }))
      .then((data: { user: HeaderUser | null }) => setUser(data.user))
      .catch(() => {
        // Aborted, or offline: keep showing what we had.
      });
    return () => controller.abort();
  }, [pathname]);

  return user;
}
