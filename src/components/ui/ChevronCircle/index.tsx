import { ChevronDown } from "lucide-react";

interface ChevronCircleProps {
  /**
   * Whether the thing it toggles is open (the arrow flips up). Leave it out
   * inside a `<details className="group">`, and the arrow follows the
   * details' own open state through `group-open:`.
   */
  open?: boolean;
  /** "md" for full-width rows (accordions, menu rows), "sm" inline next to text. */
  size?: "md" | "sm";
}

// Every class is written out in full: Tailwind only generates classes it can
// find as complete strings in the source, so they can't be pieced together.
const SIZES = {
  md: {
    circle: "h-7 w-7",
    icon: "h-4 w-4",
    closed: "translate-y-px",
    open: "-translate-y-px rotate-180",
    details: "translate-y-px group-open:-translate-y-px group-open:rotate-180",
  },
  sm: {
    circle: "h-5 w-5",
    icon: "h-3.5 w-3.5",
    closed: "translate-y-[0.5px]",
    open: "-translate-y-[0.5px] rotate-180",
    details: "translate-y-[0.5px] group-open:-translate-y-[0.5px] group-open:rotate-180",
  },
};

/**
 * The site's expand/collapse arrow: a ⌄ in a gray circle that turns blue
 * while its trigger is hovered or keyboard-focused. The trigger (button or
 * summary) must have the `group/chevron` class for the hover color to work;
 * a named group so it doesn't clash with any other `group` around it.
 *
 * The arrow is nudged by a pixel (optical centering): a chevron's weight sits
 * where its arms are, so ⌄ looks high and ⌃ looks low when only box-centered.
 */
export default function ChevronCircle({ open, size = "md" }: ChevronCircleProps) {
  const sizeClasses = SIZES[size];
  const arrowState =
    open === undefined ? sizeClasses.details : open ? sizeClasses.open : sizeClasses.closed;

  return (
    <span
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center rounded-full bg-zinc-200 text-zinc-900 transition-colors duration-200 group-hover/chevron:bg-sky-600 group-hover/chevron:text-white group-focus-visible/chevron:bg-sky-600 group-focus-visible/chevron:text-white dark:bg-zinc-700 dark:text-zinc-100 ${sizeClasses.circle}`}
    >
      <ChevronDown className={`transition-transform duration-300 ${sizeClasses.icon} ${arrowState}`} />
    </span>
  );
}
