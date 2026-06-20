"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useCallback } from "react";

// ── CSS classes (defined in styles.css) ──────────────────────────
//
// .pageEnter {
//   animation: slideInUp 300ms ease-out, fadeIn 300ms ease-out;
// }
// .pageExit {
//   animation: slideOutDown 200ms ease-in, fadeOut 200ms ease-in;
// }
//
// @media (prefers-reduced-motion: reduce) {
//   .pageEnter,
//   .pageExit {
//     animation: none !important;
//   }
// }

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Use a counter key so every route change forces a remount
  const [key, setKey] = useState(0);
  const prevPathRef = useRef(pathname);

  useEffect(() => {
    if (prevPathRef.current !== pathname) {
      prevPathRef.current = pathname;
      setKey((k) => k + 1);
    }
  }, [pathname]);

  return (
    <div key={key} className="pageEnter">
      {children}
    </div>
  );
}
