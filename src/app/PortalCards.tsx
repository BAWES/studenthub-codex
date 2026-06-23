"use client";

import Link from "next/link";
import {
  UserRound,
  Briefcase,
  Building2,
  Shield,
  ClipboardCheck,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const portals = [
  {
    id: "candidate",
    icon: UserRound,
    label: "Students & candidates",
    audience: "Build profiles, get matched, track work",
  },
  {
    id: "staff",
    icon: Briefcase,
    label: "Staff operations",
    audience: "Search, shortlist, place candidates",
  },
  {
    id: "company",
    icon: Building2,
    label: "Companies",
    audience: "Request workers, review candidates, receive invoices",
  },
  {
    id: "admin",
    icon: Shield,
    label: "Admin",
    audience: "Approvals, finance, payroll, compliance",
  },
  {
    id: "inspector",
    icon: ClipboardCheck,
    label: "Inspectors",
    audience: "Review civil ID and document queues",
  },
];

export default function PortalCards() {
  return (
    <section
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 max-sm:gap-2"
      aria-label="StudentHub portals"
    >
      {portals.map((portal) => {
        const Icon = portal.icon;
        return (
          <Link
            key={portal.id}
            href="/login"
            className="group no-underline"
          >
            <Card className="h-full transition-all duration-150 group-hover:-translate-y-0.5 group-hover:shadow-md">
              <CardContent className="flex flex-col gap-2 p-4">
                <Icon className="size-5 text-primary shrink-0" />
                <span className="text-xs font-bold text-primary uppercase tracking-wide">
                  {portal.label}
                </span>
                <strong className="text-sm">{portal.audience}</strong>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </section>
  );
}
