import Link from "next/link";
import type { NavItem } from "./navigation";
import { Card, CardContent } from "@/components/ui/card";

export function FeatureGrid({ items }: { items: NavItem[] }) {
  return (
    <section
      className="grid grid-cols-4 max-lg:grid-cols-3 max-md:grid-cols-2 max-sm:grid-cols-1 gap-3 pt-5"
      aria-label="Workspace features"
    >
      {items.map((item) => (
        <Link
          className="no-underline"
          href={item.href}
          key={item.href}
        >
          <Card className="min-h-[112px] border-t-4 border-t-[#1f73b7] shadow-sm hover:shadow-md hover:-translate-y-px transition-all duration-150">
            <CardContent className="p-4 h-full grid content-between gap-2">
              <span className="text-lg font-bold text-foreground">{item.label}</span>
              <strong className="text-[13px] text-[#1f73b7]">Open</strong>
            </CardContent>
          </Card>
        </Link>
      ))}
    </section>
  );
}
