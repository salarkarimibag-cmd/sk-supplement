"use client";

import { useState } from "react";

export default function Newsletter() {
  const [email, setEmail] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // TODO: send `email` to a newsletter API route once it exists
  }

  return (
    <section className="rounded-lg border border-black/[.08] p-6 dark:border-white/[.145]">
      <h2 className="text-lg font-semibold">عضویت در خبرنامه</h2>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        از تخفیف‌ها و محصولات جدید باخبر شوید.
      </p>
      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="ایمیل شما"
          className="flex-1 rounded-md border border-black/[.08] px-3 py-2 text-sm dark:border-white/[.145] dark:bg-transparent"
        />
        <button
          type="submit"
          className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
        >
          عضویت
        </button>
      </form>
    </section>
  );
}
