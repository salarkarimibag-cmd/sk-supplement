"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

// Three.js is large and needs the browser (WebGL), so the scene is split into
// its own chunk and only rendered on the client.
const Scene = dynamic(() => import("./Scene"), { ssr: false });

/**
 * Reserves a square for the hero's 3D scene (a supplement tub with capsules
 * around it) and loads it only once the visitor is near it. While it's
 * off-screen, the scene stops animating.
 */
export default function HeroScene() {
  const container = useRef<HTMLDivElement>(null);
  const [hasBeenNear, setHasBeenNear] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

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
      {hasBeenNear && <Scene isActive={isVisible} />}
    </div>
  );
}
