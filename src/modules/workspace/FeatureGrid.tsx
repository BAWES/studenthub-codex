import Link from "next/link";
import type { NavItem } from "./navigation";

export function FeatureGrid({ items }: { items: NavItem[] }) {
  return (
    <section
      className="grid grid-cols-4 gap-3 pt-5 max-[1040px]:grid-cols-1"
      aria-label="Workspace features"
    >
      {items.map((item) => (
        <Link
          className="min-h-28 grid content-between border border-[var(--line)] border-t-[4px] border-t-[var(--blue)] bg-[var(--surface)] text-[var(--ink)] p-4 no-underline shadow-[0_10px_36px_rgba(16,24,40,0.04)] hover:border-[#9fb9db] hover:shadow-[0_18px_54px_rgba(16,24,40,0.09)] hover:-translate-y-px transition-[transform,box-shadow,border-color] duration-160"
          href={item.href}
          key={item.href}
        >
          <span className="text-lg font-bold">{item.label}</span>
          <strong className="text-[var(--blue)] text-[13px]">Open</strong>
        </Link>
      ))}
    </section>
  );
}
