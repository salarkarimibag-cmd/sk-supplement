export interface NavLink {
  href: string;
  label: string;
}

/** A top-level menu item that opens a submenu (a flyout on desktop, a sliding panel on mobile). */
export interface NavSection {
  id: string;
  title: string;
  links: NavLink[];
  viewAllHref: string;
}

/**
 * Builds the site menu's submenus from the categories and brands in the
 * database. A section with nothing in it is left out, so the menu never
 * opens an empty panel.
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
      viewAllHref: "/products",
    },
    {
      id: "brands",
      title: "برندها",
      links: brands.map((brand) => ({
        // Brand names can contain spaces or "&", which aren't safe in a query string as-is.
        href: `/products?brand=${encodeURIComponent(brand)}`,
        label: brand,
      })),
      viewAllHref: "/products",
    },
  ];
  return sections.filter((section) => section.links.length > 0);
}
