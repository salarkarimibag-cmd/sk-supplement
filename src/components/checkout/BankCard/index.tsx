"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { formatCardNumber, type ShopCard } from "@/lib/cardPayment";

// The chip is drawn as an inline SVG: a rounded gold rectangle with the
// contact-pad lines of a real EMV chip. Being SVG, it stays sharp at any size.
function CardChip() {
  return (
    <svg aria-hidden="true" viewBox="0 0 48 36" className="h-9 w-12">
      <rect width="48" height="36" rx="6" fill="#e5c76b" />
      <g fill="none" stroke="#a8862a" strokeWidth="1.2">
        <path d="M0 12h14a4 4 0 0 1 4 4v4a4 4 0 0 1-4 4H0" />
        <path d="M48 12H34a4 4 0 0 0-4 4v4a4 4 0 0 0 4 4h14" />
        <path d="M18 0v36M30 0v36" />
      </g>
    </svg>
  );
}

// Two overlapping translucent circles, as on many bank cards.
function CardMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 48 30" className="h-7 w-11 opacity-80">
      <circle cx="17" cy="15" r="13" fill="#ffffff" fillOpacity="0.35" />
      <circle cx="31" cy="15" r="13" fill="#ffffff" fillOpacity="0.55" />
    </svg>
  );
}

/** The shop's bank card, drawn like a real one, with a button to copy its number. */
export default function BankCard({ card }: { card: ShopCard }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(card.number);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access can be denied; the number is still on screen to copy by hand.
    }
  }

  return (
    <div
      // 1.586 is the aspect ratio of a standard ISO/IEC 7810 ID-1 bank card.
      className="relative mx-auto flex aspect-[1.586] w-full max-w-sm flex-col justify-between overflow-hidden rounded-2xl bg-linear-to-br from-sky-500 via-sky-700 to-indigo-900 p-4 text-white shadow-lg sm:p-5"
    >
      {/* Soft highlights give the flat gradient some depth. */}
      <div aria-hidden="true" className="pointer-events-none absolute -top-16 -right-10 h-48 w-48 rounded-full bg-white/10" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-20 -left-12 h-56 w-56 rounded-full bg-white/10" />

      <div className="relative flex items-start justify-between">
        <CardChip />
        <span className="text-sm font-bold">{card.bank ?? "کارت بانکی"}</span>
      </div>

      {/* The number is LTR (digits read left to right) and set in a monospace face.
          Sized for phones: 19 characters at text-xl are ~266px wide, more than
          the ~200-250px inside the card on a 320-360px-wide screen. */}
      <p
        dir="ltr"
        className="relative text-center font-mono text-[15px] font-bold tracking-wide whitespace-nowrap drop-shadow min-[360px]:text-base min-[360px]:tracking-wider sm:text-2xl sm:tracking-widest"
      >
        {formatCardNumber(card.number)}
      </p>

      <div className="relative flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] whitespace-nowrap text-white/70">صاحب کارت</p>
          <p className="truncate text-sm font-bold">{card.holder}</p>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            onClick={handleCopy}
            className="flex cursor-pointer items-center gap-1 rounded-full bg-white/20 px-3 py-1.5 text-xs font-semibold backdrop-blur-sm transition hover:bg-white/30"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "کپی شد" : "کپی شماره"}
          </button>
          {/* Decoration only, so it gives way to the holder's name on very narrow screens. */}
          <div className="hidden min-[360px]:block">
            <CardMark />
          </div>
        </div>
      </div>
    </div>
  );
}
