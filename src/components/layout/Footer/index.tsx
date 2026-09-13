import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-black/[.08] dark:border-white/[.145]">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-8 text-sm text-zinc-600 sm:flex-row sm:items-center sm:justify-between dark:text-zinc-400">
        <p>© {new Date().getFullYear()} SK Supplement. تمامی حقوق محفوظ است.</p>
        <nav aria-label="لینک‌های فوتر" className="flex gap-4">
          <Link href="/pages/about-us">درباره ما</Link>
          <Link href="/pages/contact-us">تماس با ما</Link>
          <Link href="/pages/faq">سوالات متداول</Link>
        </nav>
      </div>
    </footer>
  );
}
