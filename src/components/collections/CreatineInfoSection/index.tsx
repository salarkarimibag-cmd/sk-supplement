const creatineBenefits = [
  {
    title: "۱) افزایش قدرت و توان",
    body: "کراتین ذخیره‌ی فسفوکراتین عضلات رو بالا می‌بره؛ همون منبع انرژی‌ای که بدن تو حرکت‌های کوتاه و سنگین مثل اسکات، پرس و دوی سرعت ازش استفاده می‌کنه. نتیجه‌اش چند تکرار بیشتر و وزنه‌ی سنگین‌تره.",
  },
  {
    title: "۲) افزایش حجم عضلانی",
    body: "وقتی بتونید با شدت بیشتری تمرین کنید، محرک رشد عضله هم بیشتر می‌شه. کراتین همچنین آب رو داخل سلول‌های عضلانی نگه می‌داره و عضلات پرتر به نظر می‌رسن.",
  },
  {
    title: "۳) ریکاوری بهتر بین ست‌ها",
    body: "با بازسازی سریع‌تر ذخایر انرژی، فاصله‌ی استراحت بین ست‌ها موثرتر می‌شه و افت عملکرد در ست‌های آخر کمتر می‌شه.",
  },
  {
    title: "۴) پشتوانه‌ی علمی قوی",
    body: "کراتین مونوهیدرات یکی از پرمطالعه‌ترین مکمل‌های ورزشیه و اثربخشی و ایمنی‌اش برای افراد سالم در تحقیقات زیادی تایید شده.",
  },
];

const creatineTypes = [
  {
    title: "کراتین مونوهیدرات",
    body: "رایج‌ترین و مقرون‌به‌صرفه‌ترین نوع کراتین؛ بیشتر تحقیقات علمی روی همین فرم انجام شده.",
  },
  {
    title: "کراتین میکرونیزه",
    body: "همون کراتین مونوهیدراته که ذراتش ریزتر شده؛ راحت‌تر تو آب حل می‌شه و برای بعضی‌ها هضمش راحت‌تره.",
  },
];

const creatineFaqs = [
  {
    question: "کراتین رو چطور و چقدر مصرف کنم؟",
    answer:
      "روش رایج، مصرف روزانه‌ی ۳ تا ۵ گرم کراتینه. بعضی‌ها یه دوره‌ی کوتاه «بارگیری» با دوز بالاتر رو هم انجام می‌دن، ولی ضروری نیست؛ با مصرف منظم روزانه، عضلات بعد از چند هفته به همون سطح اشباع می‌رسن.",
  },
  {
    question: "بهترین زمان مصرف کراتین کیه؟",
    answer:
      "مهم‌تر از زمان مصرف، مصرف منظم و هر روزه‌ست. خیلی‌ها کراتین رو بعد از تمرین همراه شیک پروتئین یا یه وعده‌ی غذایی مصرف می‌کنن؛ تو روزهای استراحت هم مصرفش رو قطع نکنید.",
  },
  {
    question: "آیا کراتین باعث احتباس آب می‌شه؟",
    answer:
      "کراتین آب رو بیشتر داخل سلول‌های عضلانی جمع می‌کنه، نه زیر پوست؛ برای همین ممکنه وزنتون در هفته‌های اول کمی بالا بره. این افزایش وزن طبیعیه و به معنی چاقی نیست. نوشیدن آب کافی در طول مصرف کراتین توصیه می‌شه.",
  },
  {
    question: "آیا کراتین برای کلیه‌ها ضرر داره؟",
    answer:
      "تحقیقات نشون داده مصرف کراتین در دوز توصیه‌شده برای افراد سالم بی‌خطره. اگه بیماری کلیوی یا مشکل زمینه‌ای دارید، قبل از مصرف حتماً با پزشک مشورت کنید.",
  },
];

export default function CreatineInfoSection() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-16">
      <h2 className="text-2xl font-extrabold">مکمل کراتین چیست؟</h2>
      <p className="mt-4 leading-8 text-zinc-600 dark:text-zinc-400">
        کراتین ترکیبی طبیعیه که بدن از آمینو اسیدها می‌سازه و بیشترش در عضلات ذخیره می‌شه. مقداری
        کراتین از غذاهایی مثل گوشت قرمز و ماهی هم دریافت می‌کنیم، ولی رسیدن به سطح اشباع عضلات
        فقط با غذا سخته.{" "}
        <span className="font-bold text-zinc-900 dark:text-zinc-100">مکمل‌های کراتین</span>{" "}
        ذخیره‌ی کراتین عضلات رو بالا می‌برن تا انرژی بیشتری برای تمرین‌های کوتاه و پرشدت در اختیار
        داشته باشید.
      </p>

      <h2 className="mt-12 text-2xl font-extrabold">فواید مصرف کراتین</h2>
      <div className="mt-6 flex flex-col gap-6">
        {creatineBenefits.map((benefit) => (
          <div key={benefit.title}>
            <h3 className="font-bold">{benefit.title}</h3>
            <p className="mt-1.5 leading-7 text-zinc-600 dark:text-zinc-400">{benefit.body}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-12 text-2xl font-extrabold">انواع مکمل‌های کراتین</h2>
      <ul className="mt-6 flex list-disc flex-col gap-4 pr-5">
        {creatineTypes.map((type) => (
          <li key={type.title}>
            <span className="font-bold">{type.title}</span>
            <p className="mt-1 leading-7 text-zinc-600 dark:text-zinc-400">{type.body}</p>
          </li>
        ))}
      </ul>

      <h2 className="mt-12 text-2xl font-extrabold">از کجا کراتین باکیفیت بخریم؟</h2>
      <p className="mt-4 leading-8 text-zinc-600 dark:text-zinc-400">
        کیفیت و خلوص کراتین مستقیماً روی نتیجه‌ای که می‌گیرید اثر داره.{" "}
        <span className="font-bold text-zinc-900 dark:text-zinc-100">SK Supplement </span>
        کراتین و مکمل‌های عضله‌سازی اصل و باکیفیت رو با قیمت مناسب ارائه می‌ده تا با خیال راحت
        روی قدرت و حجم عضلانی‌تون کار کنید.
      </p>

      <h2 className="mt-12 text-2xl font-extrabold">سوالات متداول</h2>
      <div className="mt-6 flex flex-col gap-6">
        {creatineFaqs.map((faq, index) => (
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
