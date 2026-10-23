import { brandLabel } from "@/lib/brands";

export interface NavLink {
  href: string;
  label: string;
}

/** A top-level menu item that opens a list of links (a dropdown on desktop). */
export interface NavSection {
  id: string;
  title: string;
  links: NavLink[];
}

/**
 * Builds the site menu's submenus from the categories and brands in the
 * database. A section with nothing in it is left out, so the menu never
 * opens an empty dropdown.
 */
export function buildNavSections(
  categories: { slug: string; title: string }[],
  brands: string[]
): NavSection[] {
  const sections: NavSection[] = [
    {
      id: "categories",
      title: "دسته‌بندی‌ها",
      links: categories.map((category) => ({
        href: `/collections/${category.slug}`,
        label: category.title,
      })),
    },
    {
      id: "brands",
      title: "برندها",
      links: brands
        .map((brand) => ({
          // Brand names can contain spaces or "&", which aren't safe in a query string as-is.
          href: `/products?brand=${encodeURIComponent(brand)}`,
          label: brandLabel(brand),
        }))
        // Sorted by the Persian name shown, not the English one stored.
        .sort((a, b) => a.label.localeCompare(b.label, "fa")),
    },
  ];
  return sections.filter((section) => section.links.length > 0);
}
