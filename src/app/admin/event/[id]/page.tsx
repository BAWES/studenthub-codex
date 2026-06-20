import { notFound } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";
import { requireRoleCapability } from "@/modules/auth/session";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getEvent } from "./actions";

export const dynamic = "force-dynamic";

function formatDateValue(d: Date | string | null | undefined): string {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AdminEventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRoleCapability("admin", "admin.system");
  const { id } = await params;

  const event = await getEvent({ id });

  if (!event) {
    notFound();
  }

  const facts = [
    { label: "Activity UUID", value: event.activity_uuid },
    { label: "Request UUID", value: event.request_uuid },
    { label: "Detail", value: event.activity_detail },
    { label: "Staff Name", value: event.staff_name ?? "—" },
    {
      label: "Created",
      value: formatDateValue(event.activity_created_datetime),
    },
    {
      label: "Updated",
      value: formatDateValue(event.activity_updated_datetime),
    },
  ];

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin / Events"
      title={`Activity Event — ${event.activity_detail.length > 50 ? event.activity_detail.slice(0, 50) + "…" : event.activity_detail}`}
      metrics={[
        {
          label: "Activity UUID",
          value: event.activity_uuid,
          note: "",
        },
        {
          label: "Staff",
          value: event.staff_name ?? "—",
          note: "",
        },
        {
          label: "Created",
          value: formatDateValue(event.activity_created_datetime),
          note: "",
        },
      ]}
    >
      <Card>
        <CardHeader>
          <CardTitle>Event Details</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
            {facts.map((fact) => (
              <div key={fact.label}>
                <dt className="text-sm font-medium text-muted-foreground">
                  {fact.label}
                </dt>
                <dd className="mt-1 text-sm text-foreground break-all font-mono">
                  {fact.value}
                </dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>

      <section className="flex gap-2 p-4">
        <Link href={"/admin/events" as Route}>
          <Button variant="outline">Back to Events</Button>
        </Link>
      </section>
    </WorkspaceShell>
  );
}
