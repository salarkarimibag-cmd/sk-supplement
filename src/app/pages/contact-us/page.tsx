import type { Metadata } from "next";
import { Mail, Phone, MapPin } from "lucide-react";
import ContactForm from "@/components/contact/ContactForm";

export const metadata: Metadata = {
  title: "تماس با ما",
  description: "راه‌های ارتباط با تیم پشتیبانی SK Supplement.",
};

const contactInfo = [
  { icon: Mail, title: "ایمیل", value: "salarkarimi.bag@gmail.com", dir: undefined },
  { icon: Phone, title: "تلفن", value: "۰۹۱۸۵۵۶۶۵۱۴", dir: "ltr" as const },
  { icon: MapPin, title: "آدرس", value: "کرمانشاه، صحنه، روستای دسجرده سفلی", dir: undefined },
];

export default function ContactUsPage() {
  return (
    <div>
      <div className="flex h-48 flex-col items-center justify-center gap-3 bg-linear-to-l from-sky-600 to-zinc-900 sm:h-60">
        <Mail className="h-10 w-10 text-white/90 sm:h-12 sm:w-12" aria-hidden="true" />
        <h1 className="text-2xl font-bold text-white sm:text-3xl">تماس با ما</h1>
      </div>

      <div className="mx-auto w-full max-w-3xl px-6 py-12">
        <p className="text-zinc-600 dark:text-zinc-400">
          سوالی دارید یا نیاز به راهنمایی دارید؟ از راه‌های زیر با ما در ارتباط باشید.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {contactInfo.map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-zinc-200 p-5 dark:border-zinc-800"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-50 text-sky-600 dark:bg-sky-950 dark:text-sky-400">
                  <item.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h2 className="text-base font-bold">{item.title}</h2>
              </div>

              <p dir={item.dir} className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                {item.value}
              </p>
            </div>
          ))}
        </div>

        <h2 className="mt-10 text-lg font-bold">ارسال پیام</h2>
        <ContactForm />
      </div>
    </div>
  );
}
