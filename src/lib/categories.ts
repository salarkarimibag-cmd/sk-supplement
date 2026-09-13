export interface MegaMenuLink {
  slug: string;
  name: string;
}

export interface MegaMenuColumn {
  title: string;
  links: MegaMenuLink[];
  viewAllSlug: string;
}

export interface Category {
  slug: string;
  name: string;
  columns?: MegaMenuColumn[];
}

// TODO: replace with categories fetched from the database
export const categories: Category[] = [
  {
    slug: "shop",
    name: "فروشگاه",
    columns: [
      {
        title: "پیش‌تمرین‌ها",
        viewAllSlug: "pre-workout",
        links: [
          { slug: "pre-workout/classic", name: "پیش‌تمرین کلاسیک" },
          { slug: "pre-workout/stim-free", name: "پیش‌تمرین بدون محرک" },
          { slug: "pre-workout/pump", name: "فرمول پامپ" },
        ],
      },
      {
        title: "آمینو اسیدها",
        viewAllSlug: "aminos",
        links: [
          { slug: "aminos/eaa", name: "بهترین EAA" },
          { slug: "aminos/bcaa", name: "بهترین BCAA" },
          { slug: "aminos/glutamine", name: "گلوتامین" },
        ],
      },
      {
        title: "چربی‌سوزها",
        viewAllSlug: "fat-burner",
        links: [
          { slug: "fat-burner/cla", name: "CLA + کارنیتین" },
          { slug: "fat-burner/keto", name: "کاهش وزن کتو" },
          { slug: "fat-burner/night", name: "چربی‌سوز شبانه" },
        ],
      },
      {
        title: "سلامت و تندرستی",
        viewAllSlug: "health-wellness",
        links: [
          { slug: "health-wellness/ashwagandha", name: "آشواگاندا" },
          { slug: "health-wellness/vinegar", name: "سرکه سیب" },
          { slug: "health-wellness/vitamin-d3-k2", name: "ویتامین D3 + K2" },
        ],
      },
      {
        title: "پروتئین",
        viewAllSlug: "protein",
        links: [
          { slug: "protein/whey", name: "وی پروتئین" },
          { slug: "protein/iso", name: "ایزوله پروتئین" },
          { slug: "protein/vegan", name: "پروتئین گیاهی" },
        ],
      },
      {
        title: "کراتین و عضله‌سازی",
        viewAllSlug: "creatine",
        links: [
          { slug: "creatine/monohydrate", name: "کراتین مونوهیدرات" },
          { slug: "creatine/micronized", name: "کراتین میکرونیزه" },
          { slug: "creatine/testo", name: "بوستر تستوسترون" },
        ],
      },
    ],
  },
  { slug: "vitamins", name: "ویتامین‌ها" },
  { slug: "blog", name: "بلاگ" },
  { slug: "sale", name: "حراج ویژه" },
];
