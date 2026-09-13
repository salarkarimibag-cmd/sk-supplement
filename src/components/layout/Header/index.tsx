import Image from "next/image";
import Link from "next/link";
import CategoryMenu from "../CategoryMenu";
import MobileMenu from "../MobileMenu";

export default function Header() {
  return (
    <>
      <div className="bg-sky-600 py-2.5 text-center text-xs font-bold tracking-widest text-white uppercase">
        ارسال رایگان سراسری
      </div>
      <header dir="ltr" className="sticky top-0 z-50 bg-black">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-1.5">
          <div className="flex items-center gap-0 md:gap-2">
            <MobileMenu />

            <Link href="/" className="-ml-2 flex items-center md:ml-0">
              <Image
                src="/images/logo.png"
                alt="SK Supplement"
                width={680}
                height={380}
                priority
                className="h-20 w-auto"
              />
            </Link>

            <div className="hidden md:block">
              <CategoryMenu />
            </div>
          </div>

          <div className="flex items-center gap-6 text-white">
            <button aria-label="جستجو" className="hover:text-sky-500">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                className="h-6 w-6"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" strokeLinecap="round" />
              </svg>
            </button>

            <Link
              href="/account/login"
              aria-label="حساب کاربری"
              className="hidden hover:text-sky-500 md:block"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                className="h-6 w-6"
              >
                <circle cx="12" cy="8" r="3.5" />
                <path d="M4.5 20c1.5-4 4-6 7.5-6s6 2 7.5 6" strokeLinecap="round" />
              </svg>
            </Link>

            <Link href="/cart" aria-label="سبد خرید" className="hover:text-sky-500">
              <svg
                aria-hidden="true"
                viewBox="0 0 512 512"
                fill="currentColor"
                fillRule="evenodd"
                className="h-6 w-6"
              >
                <path d="M0,179.714v248.969c0,13.568,11.101,24.669,24.669,24.669h50.632V155.107H24.669 C11.101,155.107,0,166.146,0,179.714z" />
                <path d="M487.393,155.107h-50.632v298.245h50.632c13.506,0,24.607-11.101,24.607-24.669V179.714 C512,166.146,500.899,155.107,487.393,155.107z" />
                <path d="M357.765,81.621c0-12.668-10.305-22.973-22.97-22.973h-157.57c-12.672,0-22.976,10.305-22.976,22.973v73.486 h-30.101v298.245h263.709V155.107h-30.09V81.621z M197.418,101.818h117.177v53.289H197.418V101.818z" />
              </svg>
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}
