"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

// ── Props ──────────────────────────────────────────────────────

export interface FadeInSectionProps {
  children: ReactNode;
  className?: string;
  /** Render as <div> instead of <section> */
  asDiv?: boolean;
  /** Delay before starting animation (ms) */
  delay?: number;
  /** Duration of fade + slide animation (ms) */
  duration?: number;
  /** Distance to slide from bottom (px) */
  slideDistance?: number;
  /** Intersection threshold (0-1) */
  threshold?: number;
  /** Forwarded HTML element attrs (aria-label, etc.) */
  [key: string]: unknown;
}

type HtmlTag = "section" | "div";

// ── Component ──────────────────────────────────────────────────

export default function FadeInSection({
  children,
  className,
  asDiv = false,
  delay = 0,
  duration = 600,
  slideDistance = 24,
  threshold = 0.15,
  ...rest
}: FadeInSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  const style: React.CSSProperties = {
    opacity: visible ? 1 : 0,
    transform: visible
      ? "translateY(0)"
      : `translateY(${slideDistance}px)`,
    transition: `opacity ${duration}ms cubic-bezier(0.16, 1, 0.3, 1), transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1)`,
    transitionDelay: `${delay}ms`,
    willChange: "opacity, transform",
  };

  const Tag = (asDiv ? "div" : "section") as HtmlTag;

  return (
    <Tag ref={ref as any} className={cn(className)} style={style} {...rest}>
      {children}
    </Tag>
  );
}
