"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import ScrollFade from "@/components/ui/ScrollFade";

const TABS = [
  { href: "/admin", label: "داشبورد" },
  { href: "/admin/orders", label: "سفارش‌ها" },
  { href: "/admin/products", label: "محصولات" },
  { href: "/admin/discounts", label: "کدهای تخفیف" },
  { href: "/admin/reviews", label: "نظرات" },
  { href: "/admin/messages", label: "پیام‌های تماس" },
  { href: "/admin/subscribers", label: "مشترکین خبرنامه" },
];

/** "/admin" only on the dashboard itself; the others also on any page below them. */
function isActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * The admin panel's tab bar, with the current page's tab highlighted.
 * A client component because it reads the current path (usePathname).
 */
export default function AdminTabs() {
  const pathname = usePathname();
  const activeRef = useRef<HTMLAnchorElement>(null);

  // On phones the row scrolls sideways, so a later tab (say «مشترکین خبرنامه»)
  // could be off screen while it's the current page: bring it into view.
  // "nearest" moves nothing when it's already visible, and never scrolls
  // the page up or down.
  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [pathname]);

  return (
    // On phones the tabs don't all fit; ScrollFade fades the edge that has
    // more tabs past it, so it's clear the row scrolls.
    <nav aria-label="بخش‌های پنل مدیریت" className="mt-6 border-b border-zinc-200 dark:border-zinc-800">
      <ScrollFade className="flex gap-4">
        {TABS.map((tab) => {
          const active = isActive(pathname, tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              ref={active ? activeRef : undefined}
              aria-current={active ? "page" : undefined}
              className={`shrink-0 border-b-2 px-1 pb-3 text-sm whitespace-nowrap font-semibold hover:border-sky-600 hover:text-sky-600 ${
                active
                  ? "border-sky-600 text-sky-600"
                  : "border-transparent text-zinc-600 dark:text-zinc-400"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </ScrollFade>
    </nav>
  );
}
