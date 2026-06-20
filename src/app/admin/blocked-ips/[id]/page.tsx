import { ErrorBoundary } from "@/modules/workspace/ErrorBoundary";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";
import { requireRoleCapability } from "@/modules/auth/session";
import { DetailSection } from "@/modules/workspace/DetailPanels";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { Button } from "@/components/ui/button";
import { getBlockedIp } from "./actions";
import { formatDate } from "@/modules/workspace/format";

export const dynamic = "force-dynamic";

export default async function AdminBlockedIpDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRoleCapability("admin", "admin.read");
  const { id } = await params;

  const ip = await getBlockedIp(id);

  if (!ip) {
    notFound();
  }

  return (
    <ErrorBoundary>
      <WorkspaceShell
        session={session}
        eyebrow="Admin / Blocked IPs"
        title={`Blocked IP — ${ip.ip_address ?? "Unnamed IP"}`}
        metrics={[
          {
            label: "IP Address",
            value: ip.ip_address ?? "—",
            note: "Blocked IP",
          },
          {
            label: "UUID",
            value: ip.ip_uuid,
            note: "",
          },
        ]}
      >
        <DetailSection
          title="IP Details"
          facts={[
            { label: "IP UUID", value: ip.ip_uuid },
            { label: "IP Address", value: ip.ip_address ?? "—" },
            { label: "Note", value: ip.note ?? "—" },
            {
              label: "Created",
              value: ip.created_at ? formatDate(new Date(ip.created_at)) : "—",
            },
            {
              label: "Updated",
              value: ip.updated_at ? formatDate(new Date(ip.updated_at)) : "—",
            },
          ]}
        />

        <section className="flex gap-2 p-4">
          <Link href={"/admin/blocked-ips" as Route}>
            <Button variant="outline">Back to Blocked IPs</Button>
          </Link>
        </section>
      </WorkspaceShell>
    </ErrorBoundary>
  );
}
