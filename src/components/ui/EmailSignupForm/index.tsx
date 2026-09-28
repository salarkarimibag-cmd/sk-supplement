"use client";

import { useState } from "react";
import { ThumbsUp } from "lucide-react";

interface EmailSignupFormProps {
  className?: string;
}

export default function EmailSignupForm({ className = "" }: EmailSignupFormProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setMessage(null);

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();

      if (!response.ok) {
        setStatus("error");
        setMessage(data.message ?? "عضویت ناموفق بود.");
        return;
      }

      setStatus("success");
      setMessage(data.message ?? "عضویت شما با موفقیت ثبت شد.");
      setEmail("");
    } catch {
      setStatus("error");
      setMessage("خطایی رخ داد. دوباره تلاش کنید.");
    }
  }

  if (status === "success") {
    return (
      <p
        className={`flex max-w-md items-center justify-center gap-2 text-sm font-bold text-emerald-500 ${className}`}
      >
        {message}
        <ThumbsUp className="h-5 w-5 shrink-0" />
      </p>
    );
  }

  return (
    <div className={`max-w-md ${className}`}>
      <form
        onSubmit={handleSubmit}
        className="flex w-full items-center rounded-md border border-zinc-500 transition-shadow hover:shadow-[0_0_8px_var(--color-zinc-500)]"
      >
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="ایمیل"
          className="flex-1 bg-transparent px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500"
        />
        <button
          type="submit"
          aria-label="عضویت"
          disabled={status === "submitting"}
          className="flex cursor-pointer items-center justify-center px-4 py-3 text-zinc-400 transition-all hover:drop-shadow-[0_0_6px_var(--color-amber-400)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <svg aria-hidden="true" viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4 -scale-x-100">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M8.537.808a.5.5 0 01.817-.162l4 4a.5.5 0 010 .708l-4 4a.5.5 0 11-.708-.708L11.793 5.5H1a.5.5 0 010-1h10.793L8.646 1.354a.5.5 0 01-.109-.546z"
            />
          </svg>
        </button>
      </form>
      {status === "error" && message && <p className="mt-2 text-sm text-red-500">{message}</p>}
    </div>
  );
}
