"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ComponentProps } from "react";
import { VARIANT_SWITCH } from "@/lib/variants";

/** The longest the switch waits for the new photo before going ahead anyway. */
const MAX_WAIT_MS = 1500;

/** One loading photo per srcSet, so hovering and clicking share the download. */
const photoLoads = new Map<string, Promise<void>>();

/**
 * Downloads and decodes a photo with the same srcSet and sizes as the
 * product page's <img>, so the browser picks the same file and the page's
 * photo is then served from its cache.
 */
function loadPhoto({ srcSet, sizes }: { srcSet: string; sizes: string }) {
  let load = photoLoads.get(srcSet);
  if (!load) {
    const image = new Image();
    image.sizes = sizes;
    image.srcset = srcSet;
    // A failed load just means the switch goes ahead without waiting.
    load = image.decode().catch(() => {});
    photoLoads.set(srcSet, load);
  }
  return load;
}

interface VariantLinkProps extends Omit<ComponentProps<typeof Link>, "href" | "onNavigate"> {
  href: string;
  photo?: { srcSet: string; sizes: string };
  /** How long (ms) a click waits before switching, so the pick can be shown first. */
  holdMs?: number;
  /** The option already chosen: a click on it goes nowhere. */
  isCurrent?: boolean;
}

/**
 * A flavor or size link. The product photo sweeps over to the new variant
 * (a view transition), so the new photo has to be ready by then: it starts
 * loading as soon as the shopper points at or focuses the link, and the
 * click waits for it (at most MAX_WAIT_MS) before switching. With `holdMs`
 * the switch also waits at least that long, and the clicked link carries
 * `data-picked` meanwhile so it can be styled as the chosen one.
 */
export default function VariantLink({ href, photo, holdMs = 0, isCurrent, onClick, ...props }: VariantLinkProps) {
  const router = useRouter();
  const [picked, setPicked] = useState(false);

  function preload() {
    if (photo) loadPhoto(photo);
  }

  return (
    <Link
      {...props}
      href={href}
      // Switching flavor or size shouldn't jump back to the top of the page.
      scroll={false}
      transitionTypes={[VARIANT_SWITCH]}
      onPointerEnter={preload}
      onFocus={preload}
      onTouchStart={preload}
      data-picked={picked || undefined}
      onClick={(event) => {
        // A second tap while the first pick is still showing does nothing.
        if (picked || isCurrent) event.preventDefault();
        onClick?.(event);
      }}
      // Only called for an in-app navigation, so Ctrl+click still opens a
      // new tab as usual.
      onNavigate={(event) => {
        if (!photo && !holdMs) return;
        event.preventDefault();
        setPicked(true);
        const timeout = new Promise((resolve) => setTimeout(resolve, MAX_WAIT_MS));
        const photoReady = photo ? Promise.race([loadPhoto(photo), timeout]) : undefined;
        const held = new Promise((resolve) => setTimeout(resolve, holdMs));
        Promise.all([photoReady, held]).then(() =>
          router.push(href, { scroll: false, transitionTypes: [VARIANT_SWITCH] })
        );
      }}
    />
  );
}
