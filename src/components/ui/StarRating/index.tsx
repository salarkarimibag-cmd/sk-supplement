interface StarRatingProps {
  rating: number;
  reviewCount: number;
}

function Star({ filled }: { filled: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={filled ? 0 : 1.2}
      className="h-3.5 w-3.5"
    >
      <path d="M10 1.5l2.6 5.27 5.82.85-4.21 4.1.99 5.79L10 14.9l-5.2 2.61.99-5.79-4.21-4.1 5.82-.85L10 1.5z" />
    </svg>
  );
}

export default function StarRating({ rating, reviewCount }: StarRatingProps) {
  const rounded = Math.round(rating);

  return (
    <div className="flex items-center gap-1.5 text-amber-500">
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }, (_, index) => (
          <Star key={index} filled={index < rounded} />
        ))}
      </div>
      <span className="text-xs text-zinc-500 dark:text-zinc-400">({reviewCount})</span>
    </div>
  );
}
