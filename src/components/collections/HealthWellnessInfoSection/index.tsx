const wellnessTypes = [
  {
    title: "۱) امگا ۳ (روغن ماهی)",
    body: "اسیدهای چرب امگا ۳ (EPA و DHA) چربی‌های ضروری‌ای هستن که بدن خودش نمی‌سازه. نقش مهمی در سلامت قلب، عملکرد مغز و سلامت مفاصل دارن و برای کسایی که ماهی کم مصرف می‌کنن مکمل مناسبی هستن.",
  },
  {
    title: "۲) آشواگاندا",
    body: "یه گیاه دارویی قدیمی که جزو «آداپتوژن‌ها» حساب می‌شه؛ یعنی به بدن کمک می‌کنه با استرس بهتر کنار بیاد. خیلی‌ها برای آرامش بیشتر و کیفیت بهتر خواب مصرفش می‌کنن.",
  },
  {
    title: "۳) سرکه سیب (کپسول)",
    body: "فرم کپسولی سرکه سیب، بدون طعم تند و آسیب به مینای دندون. معمولاً برای حمایت از گوارش و به‌عنوان مکمل جانبی در کنار رژیم غذایی مصرف می‌شه.",
  },
];

const wellnessBenefits = [
  {
    title: "حمایت از سلامت قلب و مغز",
    body: "مکمل‌هایی مثل امگا ۳ به حفظ سلامت سیستم قلبی‌عروقی و عملکرد ذهنی کمک می‌کنن.",
  },
  {
    title: "مدیریت استرس و خواب بهتر",
    body: "استرس و کم‌خوابی روی ریکاوری و نتیجه‌ی تمرین اثر منفی دارن؛ مکمل‌هایی مثل آشواگاندا به آرامش و استراحت بهتر کمک می‌کنن.",
  },
  {
    title: "حمایت از گوارش",
    body: "گوارش سالم یعنی جذب بهتر مواد مغذی از غذایی که می‌خورید؛ پایه‌ی هر برنامه‌ی تغذیه‌ای موفق.",
  },
  {
    title: "تکمیل سبک زندگی سالم",
    body: "این مکمل‌ها کمک می‌کنن کمبودهای رایج رژیم غذایی روزانه جبران بشه و بدن در بهترین شرایط بمونه.",
  },
];

const wellnessFaqs = [
  {
    question: "آیا مکمل‌های سلامت فقط برای ورزشکاران مناسبن؟",
    answer:
      "نه، این مکمل‌ها برای هر کسی که می‌خواد از سلامت عمومی بدنش حمایت کنه مناسبن. البته ورزشکاران به‌خاطر فشار تمرین و نیاز بیشتر به ریکاوری، معمولاً بیشتر ازشون بهره می‌برن.",
  },
  {
    question: "امگا ۳ رو کِی مصرف کنم؟",
    answer:
      "امگا ۳ یه چربیه و همراه وعده‌ی غذایی بهتر جذب می‌شه. مصرفش همراه ناهار یا شام، احتمال طعم ماهی در دهان رو هم کمتر می‌کنه.",
  },
  {
    question: "آیا می‌تونم چند مکمل سلامت رو با هم مصرف کنم؟",
    answer:
      "معمولاً بله، ولی اگه دارو مصرف می‌کنید، باردار یا شیرده هستید یا بیماری زمینه‌ای دارید، قبل از شروع مکمل‌ها با پزشک مشورت کنید؛ بعضی مکمل‌های گیاهی ممکنه با داروها تداخل داشته باشن.",
  },
];

export default function HealthWellnessInfoSection() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-16">
      <h2 className="text-2xl font-extrabold">مکمل‌های سلامت و تندرستی چیست؟</h2>
      <p className="mt-4 leading-8 text-zinc-600 dark:text-zinc-400">
        <span className="font-bold text-zinc-900 dark:text-zinc-100">مکمل‌های سلامت و تندرستی</span>{" "}
        محصولاتی هستن که به‌جای تمرکز روی عملکرد ورزشی، از سلامت کلی بدن حمایت می‌کنن؛ از سلامت قلب
        و مغز گرفته تا گوارش، خواب و مدیریت استرس. این مکمل‌ها کنار رژیم غذایی متعادل، پایه‌ای
        محکم برای یه سبک زندگی سالم و فعال می‌سازن.
      </p>

      <h2 className="mt-12 text-2xl font-extrabold">انواع مکمل‌های سلامت و تندرستی</h2>
      <div className="mt-6 flex flex-col gap-6">
        {wellnessTypes.map((type) => (
          <div key={type.title}>
            <h3 className="font-bold">{type.title}</h3>
            <p className="mt-1.5 leading-7 text-zinc-600 dark:text-zinc-400">{type.body}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-12 text-2xl font-extrabold">فواید مکمل‌های سلامت و تندرستی</h2>
      <ul className="mt-6 flex list-disc flex-col gap-4 pr-5">
        {wellnessBenefits.map((benefit) => (
          <li key={benefit.title}>
            <span className="font-bold">{benefit.title}:</span>{" "}
            <span className="text-zinc-600 dark:text-zinc-400">{benefit.body}</span>
          </li>
        ))}
      </ul>

      <h2 className="mt-12 text-2xl font-extrabold">از کجا مکمل سلامت باکیفیت بخریم؟</h2>
      <p className="mt-4 leading-8 text-zinc-600 dark:text-zinc-400">
        وقتی پای سلامت در میونه، اصالت و کیفیت محصول از همه چیز مهم‌تره.{" "}
        <span className="font-bold text-zinc-900 dark:text-zinc-100">SK Supplement </span>
        مکمل‌های سلامت و تندرستی اصل و باکیفیت رو ارائه می‌ده تا با اطمینان از سلامت روزانه‌تون
        مراقبت کنید.
      </p>

      <h2 className="mt-12 text-2xl font-extrabold">سوالات متداول</h2>
      <div className="mt-6 flex flex-col gap-6">
        {wellnessFaqs.map((faq, index) => (
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
