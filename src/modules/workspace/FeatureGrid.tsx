import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import type { NavItem } from "./navigation";
import { ArrowUpRight } from "lucide-react";

export function FeatureGrid({ items }: { items: NavItem[] }) {
  return (
    <section
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 pb-5"
      aria-label="Workspace features"
    >
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Link href={item.href} key={item.href} className="no-underline group">
            <Card className="min-h-[112px] border-t-4 border-t-coral hover:shadow-md hover:border-coral/80 transition-all duration-150">
              <CardContent className="p-4 h-full flex flex-col justify-between">
                <div>
                  {Icon && <Icon size={20} className="text-coral mb-2" aria-hidden="true" />}
                  <span className="text-lg font-bold text-foreground block">{item.label}</span>
                </div>
                <strong className="text-coral text-xs font-bold inline-flex items-center gap-1 mt-2">
                  Open
                  <ArrowUpRight size={12} aria-hidden="true" />
                </strong>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </section>
  );
}
