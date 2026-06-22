"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * PageTransition — wraps any page with a fade-in + slide-up entrance animation.
 * The animation is CSS-driven via the .shSection class already in styles.css.
 * This component just ensures the animation replays when the route changes.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Re-trigger entrance animation on route change by briefly removing
    // and re-adding the element. The CSS animation plays on mount.
    const el = ref.current;
    if (!el) return;

    el.style.opacity = "0";
    el.style.transform = "translateY(16px)";
    el.style.transition = "none";

    // Force a reflow so the browser registers the "hidden" state
    void el.offsetHeight;

    el.style.transition =
      "opacity 400ms var(--sh-easing, cubic-bezier(0.16, 1, 0.3, 1)), transform 400ms var(--sh-easing, cubic-bezier(0.16, 1, 0.3, 1))";
    el.style.opacity = "1";
    el.style.transform = "translateY(0)";
  }, []);

  return (
    <div ref={ref} style={{ willChange: "transform, opacity" }}>
      {children}
    </div>
  );
}
