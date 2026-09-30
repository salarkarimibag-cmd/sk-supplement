interface Review {
  name: string;
  rating: number;
  comment: string;
}

function Star() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="h-6 w-6">
      <path d="M10 1.5l2.6 5.27 5.82.85-4.21 4.1.99 5.79L10 14.9l-5.2 2.61.99-5.79-4.21-4.1 5.82-.85L10 1.5z" />
    </svg>
  );
}

export default function Testimonials({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-10 text-center sm:grid-cols-3">
      {reviews.map((review, index) => (
        <div
          key={index}
          className="animate-[fade-in-up_0.5s_ease-out_backwards]"
          style={{ animationDelay: `${Math.min(index, 8) * 80}ms` }}
        >
          <div className="flex justify-center gap-1 text-sky-500">
            {Array.from({ length: review.rating }, (_, starIndex) => (
              <Star key={starIndex} />
            ))}
          </div>
          <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">{review.comment}</p>
          <p className="mt-2 text-sm font-semibold text-zinc-500 italic dark:text-zinc-400">
            — {review.name}
          </p>
        </div>
      ))}
    </div>
  );
}
