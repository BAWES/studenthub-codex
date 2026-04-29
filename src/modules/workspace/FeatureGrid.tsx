import Link from "next/link";
import type { NavItem } from "./navigation";

export function FeatureGrid({ items }: { items: NavItem[] }) {
  return (
    <section className="featureGrid" aria-label="Workspace features">
      {items.map((item) => (
        <Link className="featureTile" href={item.href} key={item.href}>
          <span>{item.label}</span>
          <strong>Open</strong>
        </Link>
      ))}
    </section>
  );
}
