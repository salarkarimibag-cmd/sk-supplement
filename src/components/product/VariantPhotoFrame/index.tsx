"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

const ReportRailOpen = createContext<(open: boolean) => void>(() => {});

/** Lets the variant rail tell the photo frame around it whether its list is open. */
export function useReportRailOpen() {
  return useContext(ReportRailOpen);
}

/**
 * The box around a product's photo. While the variant rail's list is open on
 * mobile, `data-open` is set and the photo inside makes room for it (the
 * `group/photo` classes on the photo).
 */
export default function VariantPhotoFrame({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <ReportRailOpen value={setOpen}>
      <div data-open={open || undefined} className={`group/photo relative ${className}`}>
        {children}
      </div>
    </ReportRailOpen>
  );
}
