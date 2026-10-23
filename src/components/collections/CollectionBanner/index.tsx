import type { CSSProperties } from "react";
import Image, { getImageProps } from "next/image";

type CollectionBannerProps = {
  title: string;
  /** Wide banner for tablets and desktops. */
  image?: string;
  /** Taller 3:2 crop for phones; when missing, `image` is used everywhere. */
  mobileImage?: string;
  /** CSS aspect-ratio of `image`, e.g. "4 / 1". */
  aspect: string;
};

// Must match Tailwind's `md` breakpoint used in the class names below.
const DESKTOP_MEDIA = "(min-width: 768px)";

export default function CollectionBanner({ title, image, mobileImage, aspect }: CollectionBannerProps) {
  // No artwork yet: keep the space with an empty frame so the layout doesn't jump.
  if (!image) {
    return (
      <div
        className="relative w-full overflow-hidden bg-zinc-100 dark:bg-zinc-900"
        style={{ aspectRatio: aspect }}
      >
        <div className="absolute inset-4 flex items-center justify-center rounded-xl border-2 border-dashed border-zinc-300 text-sm text-zinc-400 dark:border-zinc-700 dark:text-zinc-500">
          جای بنر این دسته‌بندی
        </div>
      </div>
    );
  }

  // Only one image: the same picture at every screen width.
  if (!mobileImage) {
    return (
      <div
        className="relative w-full overflow-hidden bg-zinc-100 dark:bg-zinc-900"
        style={{ aspectRatio: aspect }}
      >
        <Image src={image} alt={title} fill preload sizes="100vw" className="object-cover" />
      </div>
    );
  }

  // Art direction: a different crop per screen size. <picture> lets the
  // browser download only the file whose <source> media query matches.
  const common = { alt: title, fill: true, sizes: "100vw" };
  const {
    props: { srcSet: desktopSrcSet },
  } = getImageProps({ ...common, src: image });
  const {
    props: { srcSet: mobileSrcSet, ...imgProps },
  } = getImageProps({ ...common, src: mobileImage, loading: "eager", fetchPriority: "high" });

  return (
    <div
      className="relative aspect-[3/2] w-full overflow-hidden bg-zinc-100 md:aspect-(--banner-aspect) dark:bg-zinc-900"
      style={{ "--banner-aspect": aspect } as CSSProperties}
    >
      <picture>
        <source media={DESKTOP_MEDIA} srcSet={desktopSrcSet} sizes="100vw" />
        <img {...imgProps} srcSet={mobileSrcSet} alt={title} className="object-cover" />
      </picture>
    </div>
  );
}
