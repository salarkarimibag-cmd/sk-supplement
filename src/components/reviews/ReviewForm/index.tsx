"use client";

import { useState } from "react";
import { Star, ThumbsUp } from "lucide-react";

const inputClass =
  "w-full rounded border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-sky-600 dark:border-zinc-700 dark:bg-zinc-900";

export default function ReviewForm() {
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [feedback, setFeedback] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setFeedback(null);

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, rating, comment }),
      });
      const data = await response.json();

      if (!response.ok) {
        setStatus("error");
        setFeedback(data.message ?? "ثبت نظر ناموفق بود.");
        return;
      }

      setStatus("success");
      setFeedback(data.message ?? "نظر شما با موفقیت ثبت شد.");
      setName("");
      setRating(5);
      setComment("");
    } catch {
      setStatus("error");
      setFeedback("خطایی رخ داد. دوباره تلاش کنید.");
    }
  }

  if (status === "success") {
    return (
      <p
        role="status"
        aria-live="polite"
        className="mx-auto mt-6 flex max-w-xl items-center justify-center gap-2 text-center text-sm font-bold text-emerald-600 dark:text-emerald-500"
      >
        {feedback}
        <ThumbsUp className="h-5 w-5 shrink-0" />
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto mt-6 flex max-w-xl flex-col gap-4">
      <label htmlFor="review-name" className="sr-only">
        نام شما
      </label>
      <input
        id="review-name"
        type="text"
        required
        placeholder="نام شما"
        value={name}
        onChange={(event) => setName(event.target.value)}
        className={inputClass}
      />

      <div
        role="radiogroup"
        aria-label="امتیاز شما"
        className="flex items-center justify-center gap-1 text-sky-500"
      >
        {Array.from({ length: 5 }, (_, index) => {
          const value = index + 1;
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={value === rating}
              aria-label={`امتیاز ${value} از ۵`}
              onClick={() => setRating(value)}
              className="cursor-pointer"
            >
              <Star
                className="h-6 w-6"
                fill={value <= rating ? "currentColor" : "none"}
              />
            </button>
          );
        })}
      </div>

      <label htmlFor="review-comment" className="sr-only">
        نظر شما درباره ما
      </label>
      <textarea
        id="review-comment"
        required
        placeholder="نظر شما درباره ما"
        rows={4}
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        className={inputClass}
      />

      {status === "error" && feedback && (
        <p role="alert" className="text-center text-sm text-red-600">
          {feedback}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="cursor-pointer rounded bg-sky-600 py-3 text-sm font-bold text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "submitting" ? "در حال ارسال..." : "ثبت نظر"}
      </button>
    </form>
  );
}
