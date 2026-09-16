const aminoBenefits = [
  {
    title: "۱) عضله‌سازی و ریکاوری",
    body: "آمینو اسیدها، به‌خصوص آمینو اسیدهای شاخه‌دار (BCAA) لوسین، ایزولوسین و والین، به ترمیم عضله و سنتز پروتئین کمک می‌کنن.",
  },
  {
    title: "۲) بهبود عملکرد ورزشی",
    body: "مکمل‌های آمینو اسیدی می‌تونن استقامت رو بالا ببرن، خستگی عضلانی رو کم کنن و درد بعد از تمرین رو تسکین بدن؛ یعنی عملکرد ورزشی بهتر.",
  },
  {
    title: "۳) فواید متابولیکی",
    body: "آمینو اسیدهای ضروری به تنظیم متابولیسم قند و چربی، عملکرد میتوکندری و حفظ وزن سالم بدن کمک می‌کنن.",
  },
];

const aminoTypes = [
  {
    title: "آمینو اسیدهای شاخه‌دار (BCAA)",
    body: "شامل لوسین، ایزولوسین و والین؛ برای سنتز پروتئین عضلانی و تولید انرژی ضروری هستن.",
  },
  {
    title: "آمینو اسیدهای ضروری (EAA)",
    body: "آمینو اسیدهایی که بدن خودش نمی‌تونه بسازه و باید از رژیم غذایی یا مکمل تامین بشن.",
  },
  {
    title: "فرمول‌های آب‌رسانی و ریکاوری",
    body: "ترکیب‌های ویژه‌ای که برای بهبود آب‌رسانی بدن و تسریع ریکاوری بعد از تمرین طراحی شدن.",
  },
];

const aminoFaqs = [
  {
    question: "آیا مکمل‌های آمینو اسیدی مصرفشون بی‌خطره؟",
    answer:
      "بله، مکمل‌های آمینو اسیدی معمولاً برای اکثر افراد وقتی طبق دستور مصرف بشن بی‌خطرن. مهمه که دوز توصیه‌شده رو رعایت کنید و اگه بیماری زمینه‌ای دارید، با پزشک مشورت کنید.",
  },
  {
    question: "آیا باید مکمل آمینو اسید مصرف کنم؟",
    answer:
      "اگه دنبال ریکاوری بهتر عضلانی، بهبود عملکرد تمرین یا افزایش سنتز پروتئین هستید، مکمل آمینو اسیدی می‌تونه مفید باشه. برای تشخیص تناسب اون با هدف تمرینی و سلامتی‌تون، مشورت با متخصص توصیه می‌شه.",
  },
  {
    question: "بهترین زمان مصرف مکمل آمینو اسیدی کیه؟",
    answer:
      "مکمل‌های آمینو اسیدی رو می‌شه هر ساعتی از روز مصرف کرد. برای استقامت و انرژی بیشتر حین تمرین، قبل یا حین ورزش مصرفش کنید؛ مصرف بعد از تمرین هم به تسریع ریکاوری کمک می‌کنه.",
  },
];

export default function AminosInfoSection() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-16">
      <h2 className="text-2xl font-extrabold">مکمل آمینو اسید چیست؟</h2>
      <p className="mt-4 leading-8 text-zinc-600 dark:text-zinc-400">
        آمینو اسیدها واحدهای سازنده‌ی پروتئین هستن و برای بسیاری از عملکردهای حیاتی بدن ضروری‌اند.
        ۹ آمینو اسید ضروری وجود داره که بدن نمی‌تونه خودش بسازه و باید از طریق رژیم غذایی تامین
        بشن.{" "}
        <span className="font-bold text-zinc-900 dark:text-zinc-100">مکمل‌های آمینو اسیدی</span>{" "}
        نسبت به غذای کامل، منبعی متمرکزتر و سریع‌الجذب‌تر از آمینو اسیدهای ضروری فراهم می‌کنن. طبق
        تحقیقات، مصرف آمینو اسیدهای ضروری، به‌خصوص قبل و بعد از تمرین، می‌تونه سنتز پروتئین عضلانی
        رو موثرتر از دریافت همون مقدار از منابع پروتئین کامل تحریک کنه.
      </p>

      <h2 className="mt-12 text-2xl font-extrabold">فواید مکمل‌های آمینو اسیدی</h2>
      <div className="mt-6 flex flex-col gap-6">
        {aminoBenefits.map((benefit) => (
          <div key={benefit.title}>
            <h3 className="font-bold">{benefit.title}</h3>
            <p className="mt-1.5 leading-7 text-zinc-600 dark:text-zinc-400">{benefit.body}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-12 text-2xl font-extrabold">انواع مکمل‌های آمینو اسیدی</h2>
      <ul className="mt-6 flex list-disc flex-col gap-4 pr-5">
        {aminoTypes.map((type) => (
          <li key={type.title}>
            <span className="font-bold">{type.title}</span>
            <p className="mt-1 leading-7 text-zinc-600 dark:text-zinc-400">{type.body}</p>
          </li>
        ))}
      </ul>

      <h2 className="mt-12 text-2xl font-extrabold">از کجا آمینو اسید باکیفیت بخریم؟</h2>
      <p className="mt-4 leading-8 text-zinc-600 dark:text-zinc-400">
        بدن شما از آمینو اسیدها برای ساخت پروتئین استفاده می‌کنه. مکمل‌های آمینو اسیدی در قالب
        پودر، کپسول، قرص و مایع موجودن.{" "}
        <span className="font-bold text-zinc-900 dark:text-zinc-100">SK Supplement </span>
        طیف کاملی از مکمل‌های آمینو اسیدی با کیفیت بالا و قیمت مناسب رو ارائه می‌ده تا بتونید با
        اطمینان مسیر تناسب اندامتون رو ادامه بدید.
      </p>

      <h2 className="mt-12 text-2xl font-extrabold">سوالات متداول</h2>
      <div className="mt-6 flex flex-col gap-6">
        {aminoFaqs.map((faq, index) => (
          <div key={faq.question}>
            <p className="font-bold">
              {index + 1}) {faq.question}
            </p>
            <p className="mt-1.5 leading-7 text-zinc-600 dark:text-zinc-400">{faq.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
