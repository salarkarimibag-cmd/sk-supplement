const testimonials = [
  {
    title: "خدمات مشتری و پشتیبانی عالی",
    quote: "همیشه راضی بودم!",
    name: "سالار",
  },
  {
    title: "برند مورد اعتماد من!",
    quote: "برند مورد اعتماد من برای یک دهه!",
    name: "امید",
  },
  {
    title: "ارسال سریع و به‌موقع",
    quote: "ارسال سریع و به‌موقع",
    name: "محمد",
  },
];

function Star() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="h-6 w-6">
      <path d="M10 1.5l2.6 5.27 5.82.85-4.21 4.1.99 5.79L10 14.9l-5.2 2.61.99-5.79-4.21-4.1 5.82-.85L10 1.5z" />
    </svg>
  );
}

export default function Testimonials() {
  return (
    <div className="grid grid-cols-1 gap-10 text-center sm:grid-cols-3">
      {testimonials.map((testimonial) => (
        <div key={testimonial.name}>
          <div className="flex justify-center gap-1 text-sky-500">
            {Array.from({ length: 5 }, (_, index) => (
              <Star key={index} />
            ))}
          </div>
          <h3 className="mt-4 text-lg font-bold text-zinc-700 dark:text-zinc-200">
            {testimonial.title}
          </h3>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{testimonial.quote}</p>
          <p className="mt-2 text-sm font-semibold text-zinc-500 italic dark:text-zinc-400">
            — {testimonial.name}
          </p>
        </div>
      ))}
    </div>
  );
}
