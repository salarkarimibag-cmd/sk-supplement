"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * A home-page category tile. With a mouse, its colors and motion are driven
 * by CSS hover. Touch screens have no hover, so there the tile marks itself
 * `data-active` while it crosses the middle of the screen, and the same
 * styles key off that (`group-data-active:`).
 */
export default function ShowcaseTile({
  href,
  className,
  children,
}: {
  href: string;
  className: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const tile = ref.current;
    if (!tile || window.matchMedia("(hover: hover)").matches) return;

    // The negative margins shrink the viewport to a thin band (10% of its
    // height) across the middle, so "intersecting" means "the tile is in the
    // middle of the screen" — thin enough that about one row lights up at a time.
    const observer = new IntersectionObserver(([entry]) => setIsActive(entry.isIntersecting), {
      rootMargin: "-45% 0px -45% 0px",
    });
    observer.observe(tile);
    return () => observer.disconnect();
  }, []);

  return (
    <Link ref={ref} href={href} data-active={isActive || undefined} className={className}>
      {children}
    </Link>
  );
}
