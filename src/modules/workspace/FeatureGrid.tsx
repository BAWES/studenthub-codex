import Link from "next/link";
import type { NavItem } from "./navigation";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

export function FeatureGrid({ items }: { items: NavItem[] }) {
  return (
    <section
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 pt-5"
      aria-label="Workspace features"
    >
      {items.map((item) => (
        <Link
          className="block no-underline transition-all duration-150 hover:-translate-y-px"
          href={item.href}
          key={item.href}
        >
          <Card className="border-t-4 border-t-[#1f73b7] h-full hover:shadow-md hover:border-[#9fb9db]">
            <CardContent className="p-4 min-h-[112px] grid content-between">
              <span className="text-lg font-bold text-foreground">{item.label}</span>
              <strong className="text-[#1f73b7] text-sm font-semibold">Open</strong>
            </CardContent>
          </Card>
        </Link>
      ))}
    </section>
  );
}
