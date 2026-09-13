import EmailSignupForm from "@/components/ui/EmailSignupForm";

export default function Newsletter() {
  return (
    <section className="bg-gray-950 py-16 text-center">
      <div className="mx-auto max-w-2xl px-6">
        <h2 className="text-2xl font-extrabold text-white sm:text-3xl">
          محدودیت‌ها را بشکن. متوقف‌نشدنی باش.
        </h2>
        <p className="mt-3 text-sm text-zinc-400 sm:text-base">
          در خبرنامه‌ی SK Supplement عضو شوید و به تخفیف‌های ویژه، علم روز و نکات تمرینی
          حرفه‌ای‌ها دسترسی پیدا کنید.
        </p>

        <EmailSignupForm className="mx-auto mt-6" />
      </div>
    </section>
  );
}
