import Link from "next/link";
import CategoryMenu from "./CategoryMenu";

export default function Header() {
  return (
    <header className="border-b border-black/[.08] dark:border-white/[.145]">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" className="text-xl font-bold tracking-tight">
          SK Supplement
        </Link>
        <CategoryMenu />
        <div className="flex items-center gap-4 text-sm font-medium">
          <Link href="/account/login">حساب کاربری</Link>
          <Link href="/cart">سبد خرید</Link>
        </div>
      </div>
    </header>
  );
}
