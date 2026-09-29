"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";

const inputClass =
  "w-full rounded border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-sky-600 dark:border-zinc-700 dark:bg-zinc-900";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [feedback, setFeedback] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setFeedback(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      const data = await response.json();

      if (!response.ok) {
        setStatus("error");
        setFeedback(data.message ?? "ارسال پیام ناموفق بود.");
        return;
      }

      setStatus("success");
      setFeedback(data.message ?? "پیام شما با موفقیت ارسال شد.");
      setName("");
      setEmail("");
      setMessage("");
    } catch {
      setStatus("error");
      setFeedback("خطایی رخ داد. دوباره تلاش کنید.");
    }
  }

  if (status === "success") {
    return (
      <p className="mt-6 flex items-center gap-2 text-sm font-bold text-emerald-600 dark:text-emerald-500">
        {feedback}
        <CheckCircle2 className="h-5 w-5 shrink-0" />
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
      <input
        type="text"
        required
        placeholder="نام و نام خانوادگی"
        value={name}
        onChange={(event) => setName(event.target.value)}
        className={inputClass}
      />
      <input
        type="email"
        required
        placeholder="ایمیل"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        className={inputClass}
      />
      <textarea
        required
        placeholder="پیام شما"
        rows={5}
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        className={inputClass}
      />

      {status === "error" && feedback && <p className="text-sm text-red-600">{feedback}</p>}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="cursor-pointer rounded bg-sky-600 py-3 text-sm font-bold text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "submitting" ? "در حال ارسال..." : "ارسال پیام"}
      </button>
    </form>
  );
}
