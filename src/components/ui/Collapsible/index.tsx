import type { ReactNode } from "react";

interface CollapsibleProps {
  open: boolean;
  /** Lets a trigger point at this region with aria-controls. */
  id?: string;
  children: ReactNode;
}

/**
 * Shows or hides its children with a smooth height + fade transition.
 *
 * `height: auto` can't be animated, so this uses the grid trick: the wrapper
 * is a one-row grid whose row goes from `0fr` to `1fr` (a fraction of the
 * free space, i.e. "collapsed" to "as tall as the content"), and CSS can
 * transition between those two. The inner box needs `min-h-0` so the row is
 * allowed to shrink below its content, and `overflow-hidden` so the content
 * is clipped while it shrinks.
 *
 * Children stay mounted when closed (form fields keep their state), so the
 * closed region is made `inert`: its inputs can't be focused or clicked and
 * screen readers skip it. Reduced-motion users get no animation from the
 * global rule in globals.css.
 *
 * Spacing inside should be padding, not margin, so it animates with the height.
 */
export default function Collapsible({ open, id, children }: CollapsibleProps) {
  return (
    <div
      id={id}
      inert={!open}
      aria-hidden={!open}
      className={`grid transition-[grid-template-rows,opacity] duration-500 ease-out ${
        open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
      }`}
    >
      <div className="min-h-0 overflow-hidden">{children}</div>
    </div>
  );
}
