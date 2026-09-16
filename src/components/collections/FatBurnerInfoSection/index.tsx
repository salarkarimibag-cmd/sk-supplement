const fatBurnerBenefits = [
  {
    title: "۱) افزایش سوخت‌وساز",
    body: "چربی‌سوزها با بالا بردن نرخ متابولیسم پایه‌ی بدن، به سوزوندن کالری بیشتر حتی در حالت استراحت کمک می‌کنن.",
  },
  {
    title: "۲) کاهش اشتها",
    body: "بسیاری از فرمول‌های چربی‌سوز با کم کردن احساس گرسنگی، کنترل کالری دریافتی رو تو رژیم غذایی راحت‌تر می‌کنن.",
  },
  {
    title: "۳) افزایش انرژی و تمرکز",
    body: "ترکیباتی مثل کافئین در چربی‌سوزها، انرژی و تمرکز ذهنی لازم برای تمرین‌های شدیدتر رو فراهم می‌کنن.",
  },
  {
    title: "۴) حفظ توده‌ی عضلانی",
    body: "چربی‌سوزهای باکیفیت طوری فرمول‌بندی می‌شن که در کنار کاهش چربی، به حفظ عضلات در طول رژیم کمک کنن.",
  },
];

const fatBurnerFaqs = [
  {
    question: "چربی‌سوزها چطور کار می‌کنن؟",
    answer:
      "چربی‌سوزها معمولاً با افزایش متابولیسم، کاهش اشتها و بالا بردن سطح انرژی عمل می‌کنن. این‌ها به بدن کمک می‌کنن کالری و چربی بیشتری بسوزونه، به‌خصوص وقتی همراه با رژیم غذایی مناسب و تمرین منظم مصرف بشن.",
  },
  {
    question: "بهترین زمان مصرف چربی‌سوز کیه؟",
    answer:
      "بیشتر چربی‌سوزها صبح یا قبل از تمرین مصرف می‌شن تا از افت انرژی جلوگیری بشه و خواب شبانه مختل نشه. حتماً دستور مصرف روی بسته‌بندی محصول رو رعایت کنید.",
  },
  {
    question: "آیا چربی‌سوز جایگزین رژیم غذایی و ورزشه؟",
    answer:
      "نه، چربی‌سوزها مکمل یه برنامه‌ی کاهش وزن هستن، نه جایگزینش. بهترین نتیجه وقتی به دست میاد که چربی‌سوز رو همراه با رژیم غذایی متعادل و تمرین منظم مصرف کنید.",
  },
];

export default function FatBurnerInfoSection() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-16">
      <h2 className="text-2xl font-extrabold">مکمل چربی‌سوز چیست؟</h2>
      <p className="mt-4 leading-8 text-zinc-600 dark:text-zinc-400">
        <span className="font-bold text-zinc-900 dark:text-zinc-100">مکمل‌های چربی‌سوز</span> برای
        کمک به کاهش وزن طراحی شدن؛ معمولاً با افزایش متابولیسم، کاهش اشتها یا بالا بردن سطح انرژی
        بدن. این محصولات معمولاً ترکیبی از کافئین، عصاره‌ی گیاهی و سایر مواد موثره هستن که در کنار
        رژیم غذایی و تمرین، به رسیدن سریع‌تر به هدف کاهش وزن کمک می‌کنن.
      </p>

      <h2 className="mt-12 text-2xl font-extrabold">فواید مصرف چربی‌سوزها</h2>
      <div className="mt-6 flex flex-col gap-6">
        {fatBurnerBenefits.map((benefit) => (
          <div key={benefit.title}>
            <h3 className="font-bold">{benefit.title}</h3>
            <p className="mt-1.5 leading-7 text-zinc-600 dark:text-zinc-400">{benefit.body}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-12 text-2xl font-extrabold">از کجا چربی‌سوز باکیفیت بخریم؟</h2>
      <p className="mt-4 leading-8 text-zinc-600 dark:text-zinc-400">
        <span className="font-bold text-zinc-900 dark:text-zinc-100">SK Supplement </span>
        طیف کاملی از چربی‌سوزهای باکیفیت رو با قیمت مناسب ارائه می‌ده تا همراه مطمئنی برای مسیر
        کاهش وزن شما باشه.
      </p>

      <h2 className="mt-12 text-2xl font-extrabold">سوالات متداول</h2>
      <div className="mt-6 flex flex-col gap-6">
        {fatBurnerFaqs.map((faq, index) => (
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
