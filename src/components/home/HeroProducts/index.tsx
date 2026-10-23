"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { ShowcaseProduct } from "@/lib/showcase";

/** How long each product stays on show, in milliseconds. */
const SLIDE_MS = 4000;

// Every photo is always in the page, stacked in one spot, and only its
// classes change: the browser then animates between them (CSS transitions)
// and the next photo is already loaded when its turn comes. The new product
// sweeps in from one side, turning upright and coming into focus, while the
// old one sweeps out the other side. The easing starts fast and settles
// slowly, which reads as smooth rather than mechanical.
const SLIDE_MOTION = "transition duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)]";
const SLIDE_STATES = {
  active: "opacity-100 translate-x-0 scale-100 rotate-0 blur-none",
  leaving: "opacity-0 -translate-x-1/3 scale-75 -rotate-12 blur-sm",
  waiting: "opacity-0 translate-x-1/3 scale-75 rotate-12 blur-sm",
} as const;

function slideState(index: number, current: number, count: number) {
  if (index === current) return SLIDE_STATES.active;
  if (index === (current - 1 + count) % count) return SLIDE_STATES.leaving;
  return SLIDE_STATES.waiting;
}

/**
 * Whether a loaded photo is a cutout (the pack on a transparent background),
 * judged by its top-left corner. A photo with a solid background would show
 * up as a white box on the dark hero.
 */
function isCutout(image: HTMLImageElement) {
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  const context = canvas.getContext("2d");
  if (!context) return true;
  // Copy just the corner pixel and read its alpha (0 = fully transparent).
  context.drawImage(image, 0, 0, 1, 1, 0, 0, 1, 1);
  return context.getImageData(0, 0, 1, 1).data[3] < 16;
}

type PhotoStatus = "ready" | "unusable";

/**
 * The hero's product showcase: real product photos, one at a time, taking
 * turns every few seconds. The one on show floats gently above a soft
 * shadow, with a blue glow behind it. Purely decorative (the hero's text and
 * links carry the content), so it's hidden from screen readers.
 */
export default function HeroProducts({ products }: { products: ShowcaseProduct[] }) {
  // Each photo is checked once it loads; those that fail to load, or have a
  // background, are left out.
  const [statuses, setStatuses] = useState<Record<string, PhotoStatus>>({});
  const [step, setStep] = useState(0);

  // The slideshow starts once every photo has been checked, so the order
  // never shifts under the visitor as photos arrive.
  const isSettled = products.every((product) => statuses[product.id]);
  const ready = isSettled ? products.filter((product) => statuses[product.id] === "ready") : [];
  const current = ready.length > 0 ? step % ready.length : -1;

  useEffect(() => {
    if (ready.length < 2) return;
    const timer = setInterval(() => setStep((value) => value + 1), SLIDE_MS);
    return () => clearInterval(timer);
  }, [ready.length]);

  function settle(id: string, status: PhotoStatus) {
    setStatuses((previous) => ({ ...previous, [id]: status }));
  }

  // Nothing to show: no products, or none of their photos worked out.
  if (products.length === 0 || (isSettled && ready.length === 0)) return null;

  return (
    <div className="relative aspect-square w-full" aria-hidden="true">
      {/* A soft brand-blue glow behind the product, breathing slowly. */}
      <div className="absolute inset-[22%] animate-[hero-glow_6s_ease-in-out_infinite] rounded-full bg-sky-500/25 blur-3xl" />

      {/* The shadow on the "floor" shrinks and fades as the product floats
          up, and grows back as it comes down: the two animations share a
          duration, so they stay in step. */}
      <div className="absolute inset-x-[28%] bottom-[9%] h-[6%] animate-[hero-shadow_6s_ease-in-out_infinite] rounded-[50%] bg-black/70 blur-md" />

      <div className="absolute inset-[12%] animate-[hero-float_6s_ease-in-out_infinite]">
        {products.map((product) => {
          const index = ready.indexOf(product);
          const state =
            index === -1 ? SLIDE_STATES.waiting : slideState(index, current, ready.length);
          return (
            <div key={product.id} className={`absolute inset-0 ${SLIDE_MOTION} ${state}`}>
              {statuses[product.id] !== "unusable" && (
                <Image
                  src={product.imageUrl}
                  alt=""
                  fill
                  // The box is about 3/4 of the hero's product column.
                  sizes="(min-width: 768px) 24vw, 14rem"
                  // All are needed within seconds, and they're small.
                  loading="eager"
                  onLoad={(event) =>
                    settle(product.id, isCutout(event.currentTarget) ? "ready" : "unusable")
                  }
                  onError={() => settle(product.id, "unusable")}
                  className="object-contain drop-shadow-[0_20px_30px_rgb(0_0_0/0.5)]"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
