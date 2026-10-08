const vitaminTypes = [
  {
    title: "۱) مولتی ویتامین",
    body: "ترکیبی از ویتامین‌ها و مواد معدنی ضروری در یه وعده؛ ساده‌ترین راه برای پوشش دادن کمبودهای احتمالی رژیم غذایی روزانه.",
  },
  {
    title: "۲) ویتامین D3 + K2",
    body: "ویتامین D3 به جذب کلسیم و سلامت استخوان و سیستم ایمنی کمک می‌کنه و K2 کمک می‌کنه کلسیم به استخوان‌ها برسه. کمبود ویتامین D، به‌خصوص در کسایی که کم در معرض نور خورشید هستن، خیلی رایجه.",
  },
  {
    title: "۳) ویتامین C",
    body: "یه آنتی‌اکسیدان قوی که در عملکرد سیستم ایمنی و ساخت کلاژن (برای سلامت پوست، تاندون و مفاصل) نقش داره.",
  },
];

const vitaminBenefits = [
  {
    title: "۱) تقویت سیستم ایمنی",
    body: "ویتامین‌هایی مثل C و D نقش کلیدی در عملکرد سیستم ایمنی دارن؛ موضوعی که برای ورزشکارانی که تمرین سنگین دارن اهمیت بیشتری پیدا می‌کنه.",
  },
  {
    title: "۲) تولید انرژی",
    body: "ویتامین‌های گروه B در تبدیل غذا به انرژی نقش دارن. کمبودشون می‌تونه باعث خستگی و افت عملکرد بشه.",
  },
  {
    title: "۳) سلامت استخوان و مفاصل",
    body: "ویتامین D، K2 و کلسیم با هم به حفظ تراکم استخوان کمک می‌کنن؛ پایه‌ای که هر برنامه‌ی تمرینی روش بنا می‌شه.",
  },
];

const vitaminFaqs = [
  {
    question: "اگه رژیم غذایی سالمی دارم، باز هم به ویتامین نیاز دارم؟",
    answer:
      "رژیم غذایی متعادل بهترین منبع ویتامین‌هاست، ولی همیشه همه‌ی نیازها رو پوشش نمی‌ده؛ مثلاً ویتامین D از غذا به مقدار کافی دریافت نمی‌شه. یه آزمایش خون ساده می‌تونه نشون بده به کدوم ویتامین‌ها نیاز بیشتری دارید.",
  },
  {
    question: "ویتامین‌ها رو کِی و چطور مصرف کنم؟",
    answer:
      "ویتامین‌های محلول در چربی (مثل D و K) همراه وعده‌ی غذایی حاوی چربی بهتر جذب می‌شن. مولتی ویتامین رو هم بهتره همراه غذا مصرف کنید تا احتمال ناراحتی معده کمتر بشه.",
  },
  {
    question: "آیا مصرف زیاد ویتامین ضرر داره؟",
    answer:
      "بله، بیشتر همیشه بهتر نیست. ویتامین‌های محلول در چربی در بدن ذخیره می‌شن و مصرف بیش از حدشون می‌تونه مشکل‌ساز باشه. دوز توصیه‌شده روی بسته‌بندی رو رعایت کنید و برای دوزهای بالاتر با پزشک مشورت کنید.",
  },
];

export default function VitaminsInfoSection() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-16">
      <h2 className="text-2xl font-extrabold">مکمل ویتامین چیست؟</h2>
      <p className="mt-4 leading-8 text-zinc-600 dark:text-zinc-400">
        ویتامین‌ها و مواد معدنی ریزمغذی‌هایی هستن که بدن به مقدار کم ولی به‌طور مداوم بهشون نیاز
        داره؛ از تولید انرژی گرفته تا عملکرد سیستم ایمنی و سلامت استخوان.{" "}
        <span className="font-bold text-zinc-900 dark:text-zinc-100">مکمل‌های ویتامین</span>{" "}
        کمک می‌کنن کمبودهایی که با رژیم غذایی روزانه جبران نمی‌شن پوشش داده بشن. ویتامین‌ها به دو
        دسته‌ی محلول در آب (مثل C و گروه B) و محلول در چربی (مثل D و K) تقسیم می‌شن.
      </p>

      <h2 className="mt-12 text-2xl font-extrabold">انواع مکمل‌های ویتامین</h2>
      <div className="mt-6 flex flex-col gap-6">
        {vitaminTypes.map((type) => (
          <div key={type.title}>
            <h3 className="font-bold">{type.title}</h3>
            <p className="mt-1.5 leading-7 text-zinc-600 dark:text-zinc-400">{type.body}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-12 text-2xl font-extrabold">فواید مصرف ویتامین‌ها</h2>
      <div className="mt-6 flex flex-col gap-6">
        {vitaminBenefits.map((benefit) => (
          <div key={benefit.title}>
            <h3 className="font-bold">{benefit.title}</h3>
            <p className="mt-1.5 leading-7 text-zinc-600 dark:text-zinc-400">{benefit.body}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-12 text-2xl font-extrabold">از کجا ویتامین باکیفیت بخریم؟</h2>
      <p className="mt-4 leading-8 text-zinc-600 dark:text-zinc-400">
        کیفیت مواد اولیه و فرم ویتامین روی میزان جذبش در بدن اثر مستقیم داره.{" "}
        <span className="font-bold text-zinc-900 dark:text-zinc-100">SK Supplement </span>
        ویتامین‌ها و مواد معدنی اصل و باکیفیت رو با قیمت مناسب ارائه می‌ده تا نیازهای روزانه‌ی
        بدنتون با خیال راحت تامین بشه.
      </p>

      <h2 className="mt-12 text-2xl font-extrabold">سوالات متداول</h2>
      <div className="mt-6 flex flex-col gap-6">
        {vitaminFaqs.map((faq, index) => (
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
