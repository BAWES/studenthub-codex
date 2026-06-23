"use client";

import { UserRound, Search, Building2, Shield, ClipboardCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const roleNotes = [
  { icon: UserRound, label: "Students", detail: "Profile, jobs, hours, pay" },
  { icon: Search, label: "Staff", detail: "Requests, candidates, CVs, time" },
  { icon: Building2, label: "Companies", detail: "Requests, candidates, invoices" },
  { icon: Shield, label: "Admin", detail: "Finance, approvals, migration" },
  { icon: ClipboardCheck, label: "Inspectors", detail: "ID review, document queues" }
];

export default function LoginRoleCards() {
  return (
    <section className="col-span-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5" aria-label="Account detection notes">
      {roleNotes.map(({ icon: Icon, label, detail }) => (
        <Card key={label}>
          <CardContent className="grid gap-1.5 p-3.5">
            <Icon className="size-4 text-coral shrink-0" aria-hidden="true" />
            <span className="text-muted-foreground text-xs font-extrabold uppercase">{label}</span>
            <strong className="text-sm text-foreground">{detail}</strong>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
