import Image from "next/image";
import Link from "next/link";
import { FacebookIcon, InstagramIcon, XIcon, YoutubeIcon } from "@/components/ui/SocialIcons";
import EmailSignupForm from "@/components/ui/EmailSignupForm";

export default function Footer() {
  return (
    <footer className="bg-black py-12 text-white">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-6 sm:grid-cols-2 md:grid-cols-4">
        <div className="flex flex-col items-center text-center">
          <Image
            src="/images/logo.webp"
            alt="SK Supplement"
            width={680}
            height={380}
            className="h-32 w-auto"
          />
          <div className="mt-5 flex gap-5">
            <Link href="#" aria-label="ایکس" className="hover:text-sky-500">
              <XIcon className="h-6 w-6" />
            </Link>
            <Link href="#" aria-label="یوتیوب" className="hover:text-sky-500">
              <YoutubeIcon className="h-6 w-6" />
            </Link>
            <Link href="#" aria-label="فیسبوک" className="hover:text-sky-500">
              <FacebookIcon className="h-6 w-6" />
            </Link>
            <Link href="#" aria-label="اینستاگرام" className="hover:text-sky-500">
              <InstagramIcon className="h-6 w-6" />
            </Link>
          </div>
        </div>

        <div>
          <h3 className="text-base font-bold uppercase">SK Supplement</h3>
          <nav className="mt-4 flex flex-col gap-3 text-sm text-zinc-400">
            <Link href="/account/login" className="hover:text-white">
              ورود / ثبت‌نام
            </Link>
            <Link href="/pages/about-us" className="hover:text-white">
              درباره ما
            </Link>
            <Link href="/pages/contact-us" className="hover:text-white">
              تماس با ما
            </Link>
            <Link href="/blogs" className="hover:text-white">
              مقالات
            </Link>
            <Link href="/pages/faq" className="hover:text-white">
              سوالات متداول
            </Link>
          </nav>
        </div>

        <div>
          <h3 className="text-base font-bold uppercase">قوانین</h3>
          <nav className="mt-4 flex flex-col gap-3 text-sm text-zinc-400">
            <Link href="/pages/terms-of-service" className="hover:text-white">
              قوانین و مقررات
            </Link>
            <Link href="/pages/refund-policy" className="hover:text-white">
              قوانین بازگشت وجه
            </Link>
            <Link href="/pages/shipping-policy" className="hover:text-white">
              قوانین ارسال
            </Link>
            <Link href="/pages/privacy-policy" className="hover:text-white">
              حریم خصوصی
            </Link>
            <Link href="/pages/accessibility" className="hover:text-white">
              دسترس‌پذیری
            </Link>
          </nav>
        </div>

        <div>
          <h3 className="text-base font-bold uppercase">ضمانت بازگشت وجه ۱۰۰٪</h3>
          <p className="mt-4 text-sm text-zinc-400">
            از خریدتان راضی نیستید؟ تا 10 روز کالا را برای بازگشت وجه ارسال کنید.{" "}
            <Link href="/pages/refund-policy" className="text-sky-500 hover:underline">
              قوانین بازگشت وجه.
            </Link>
          </p>
        </div>

      </div>

      <div className="mt-10 px-6 text-center">
        <h3 className="text-xl font-bold text-zinc-200">از تخفیف‌ها و محصولات جدید باخبر شوید</h3>
        <EmailSignupForm className="mx-auto mt-4" />
      </div>

      <div className="mt-10 border-t border-zinc-800 pt-6 text-center">
        <p className="text-sm text-zinc-500">
          © {new Date().getFullYear()} SK Supplement. تمامی حقوق محفوظ است.
        </p>

        <p className="mt-1 flex items-center justify-center gap-1.5 text-xs text-zinc-500">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            className="h-4 w-4"
          >
            <rect x="3" y="4" width="18" height="12" rx="1.5" />
            <path d="M8 20h8" strokeLinecap="round" />
            <path d="M12 16v4" strokeLinecap="round" />
          </svg>
          طراحی و توسعه توسط سالار کریمی
        </p>

        <p className="mx-auto mt-4 max-w-4xl px-6 text-xs text-zinc-500">
          این محصولات و ادعاهای مربوط به آن‌ها توسط سازمان غذا و دارو تایید نشده‌اند و برای
          تشخیص، درمان یا پیشگیری از هیچ بیماری‌ای در نظر گرفته نشده‌اند. پیش از استفاده از هر
          مکمل غذایی با پزشک خود مشورت کنید.
        </p>
      </div>
    </footer>
  );
}
