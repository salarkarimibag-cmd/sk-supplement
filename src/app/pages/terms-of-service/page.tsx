import type { Metadata } from "next";
import { ScrollText, User, BadgePercent, ClipboardList, Copyright, ShieldAlert, RefreshCw } from "lucide-react";

export const metadata: Metadata = {
  title: "قوانین و مقررات",
  description: "قوانین و مقررات استفاده از فروشگاه SK Supplement.",
};

const sections = [
  {
    icon: User,
    title: "حساب کاربری",
    body: "حفظ محرمانگی اطلاعات ورود (ایمیل و رمز عبور) بر عهده‌ی کاربر است. مسئولیت هرگونه فعالیتی که با حساب کاربری شما انجام شود، بر عهده‌ی شماست.",
  },
  {
    icon: BadgePercent,
    title: "محصولات و قیمت‌گذاری",
    body: "تلاش می‌کنیم اطلاعات و قیمت محصولات را به‌روز و دقیق نگه داریم، اما در صورت بروز خطای فنی در ثبت قیمت یا موجودی، فروشگاه حق دارد سفارش را پیش از پردازش نهایی لغو و مبلغ پرداختی را عودت دهد.",
  },
  {
    icon: ClipboardList,
    title: "ثبت و لغو سفارش",
    body: "ثبت سفارش به منزله‌ی درخواست خرید است، نه تعهد قطعی فروشگاه به تحویل. فروشگاه در موارد استثنایی (مانند اتمام موجودی یا مغایرت اطلاعات پرداخت) می‌تواند سفارش را لغو کند و مراتب را به مشتری اطلاع دهد.",
  },
  {
    icon: Copyright,
    title: "مالکیت معنوی",
    body: "تمامی محتوای این وب‌سایت، شامل متن، تصاویر و لوگو، متعلق به SK Supplement است و استفاده یا بازنشر آن بدون اجازه‌ی کتبی مجاز نیست.",
  },
  {
    icon: ShieldAlert,
    title: "محدودیت مسئولیت",
    body: "محصولات این فروشگاه مکمل غذایی هستند و جایگزین رژیم غذایی متنوع و متعادل نمی‌شوند. مصرف هر مکملی، به‌ویژه در صورت داشتن بیماری خاص یا بارداری، باید با مشورت پزشک انجام شود.",
  },
  {
    icon: RefreshCw,
    title: "تغییر قوانین",
    body: "این قوانین ممکن است به‌مرور زمان به‌روزرسانی شوند. استفاده‌ی مستمر شما از سایت پس از اعمال تغییرات، به معنای پذیرش نسخه‌ی جدید است.",
  },
];

export default function TermsOfServicePage() {
  return (
    <div>
      <div className="flex h-48 flex-col items-center justify-center gap-3 bg-linear-to-l from-sky-600 to-zinc-900 sm:h-60">
        <ScrollText className="h-10 w-10 text-white/90 sm:h-12 sm:w-12" aria-hidden="true" />
        <h1 className="text-2xl font-bold text-white sm:text-3xl">قوانین و مقررات</h1>
      </div>

      <div className="mx-auto w-full max-w-3xl px-6 py-12">
        <p className="text-zinc-600 dark:text-zinc-400">
          استفاده از فروشگاه SK Supplement به معنای پذیرش قوانین و مقررات زیر است.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {sections.map((section) => (
            <div
              key={section.title}
              className="rounded-xl border border-zinc-200 p-5 dark:border-zinc-800"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-50 text-sky-600 dark:bg-sky-950 dark:text-sky-400">
                  <section.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h2 className="text-base font-bold">{section.title}</h2>
              </div>

              <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                {section.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
