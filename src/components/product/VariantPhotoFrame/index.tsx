"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

type Side = "start" | "end";

const ReportRailOpen = createContext<(side: Side, open: boolean) => void>(() => {});

/** Lets a variant panel tell the photo frame around it whether it is open. */
export function useReportRailOpen() {
  return useContext(ReportRailOpen);
}

/**
 * The box around a product's photo. While either variant panel on mobile is
 * open, `data-open` is set and the photo inside shrinks (the `group/photo`
 * classes on the photo), making room for the panels.
 */
export default function VariantPhotoFrame({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const [openSides, setOpenSides] = useState({ start: false, end: false });

  const report = useCallback((side: Side, open: boolean) => {
    setOpenSides((current) => (current[side] === open ? current : { ...current, [side]: open }));
  }, []);

  return (
    <ReportRailOpen value={report}>
      <div
        data-open={openSides.start || openSides.end || undefined}
        className={`group/photo relative ${className}`}
      >
        {children}
      </div>
    </ReportRailOpen>
  );
}
