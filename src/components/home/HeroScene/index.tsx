"use client";

import dynamic from "next/dynamic";
import { getImageProps } from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ShowcaseProduct } from "@/lib/showcase";

// Three.js is large and needs the browser (WebGL), so the scene is split into
// its own chunk and only rendered on the client.
const Scene = dynamic(() => import("./Scene"), { ssr: false });

/** The width (in CSS pixels) the photos are fetched for; enough for the scene. */
const PHOTO_WIDTH = 384;

/**
 * Reserves a square for the hero's 3D scene (real product photos, flipping
 * from one to the next, with capsules around them) and loads it only once
 * the visitor is near it. While it's off-screen, the scene stops animating.
 */
export default function HeroScene({ products }: { products: ShowcaseProduct[] }) {
  const container = useRef<HTMLDivElement>(null);
  const [hasBeenNear, setHasBeenNear] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // getImageProps gives the same resized, compressed copy of each photo that
  // <Image> would show, instead of the full-size original. Memoized so the
  // scene gets the same array on every render and doesn't reload the photos
  // each time the visibility changes.
  const imageUrls = useMemo(
    () =>
      products.map(
        ({ imageUrl }) =>
          getImageProps({ src: imageUrl, alt: "", width: PHOTO_WIDTH, height: PHOTO_WIDTH }).props.src
      ),
    [products]
  );

  useEffect(() => {
    const element = container.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
        if (entry.isIntersecting) setHasBeenNear(true);
      },
      // Start loading a little before it scrolls into view.
      { rootMargin: "300px" }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={container} className="relative aspect-square w-full" aria-hidden="true">
      {/* A faint glow behind the scene, so its dark shapes stand out. */}
      <div className="absolute inset-[20%] rounded-full bg-white/5 blur-3xl" />
      {hasBeenNear && <Scene isActive={isVisible} imageUrls={imageUrls} />}
    </div>
  );
}
