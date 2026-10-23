"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ComponentProps } from "react";
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
}

/**
 * A flavor or size link. The product photo sweeps over to the new variant
 * (a view transition), so the new photo has to be ready by then: it starts
 * loading as soon as the shopper points at or focuses the link, and the
 * click waits for it (at most MAX_WAIT_MS) before switching.
 */
export default function VariantLink({ href, photo, ...props }: VariantLinkProps) {
  const router = useRouter();

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
      // Only called for an in-app navigation, so Ctrl+click still opens a
      // new tab as usual.
      onNavigate={(event) => {
        if (!photo) return;
        event.preventDefault();
        const timeout = new Promise((resolve) => setTimeout(resolve, MAX_WAIT_MS));
        Promise.race([loadPhoto(photo), timeout]).then(() =>
          router.push(href, { scroll: false, transitionTypes: [VARIANT_SWITCH] })
        );
      }}
    />
  );
}
