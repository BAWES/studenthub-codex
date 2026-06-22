import { ErrorBoundary } from "@/modules/workspace/ErrorBoundary";
import { notFound } from "next/navigation";
import { requireRoleCapability } from "@/modules/auth/session";
import { DetailSection } from "@/modules/workspace/DetailPanels";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { formatDate } from "@/modules/workspace/format";
import { getEvent } from "../actions";

export const dynamic = "force-dynamic";

export default async function AdminEventDetailPage({
  params,
}: {
  params: Promise<{ activityUuid: string }>;
}) {
  const session = await requireRoleCapability("admin", "admin.read");
  const { activityUuid } = await params;

  const event = await getEvent({ id: activityUuid });

  if (!event) {
    notFound();
  }

  return (
    <ErrorBoundary>
      <WorkspaceShell
        session={session}
        eyebrow="Admin / Events"
        title={`Activity event ${event.activity_uuid}`}
        metrics={[
          {
            label: "Request",
            value: event.request_uuid ?? "—",
            note: event.request_uuid ? event.request_uuid.slice(0, 8) + "…" : "",
          },
        ]}
      >
        <DetailSection
          title="Event Details"
          facts={[
            { label: "Activity UUID", value: event.activity_uuid ?? "—" },
            { label: "Request UUID", value: event.request_uuid ?? "—" },
            { label: "Detail", value: event.activity_detail ?? "—" },
            { label: "Staff", value: event.staff_name ?? "—" },
            {
              label: "Created",
              value: event.activity_created_datetime
                ? formatDate(new Date(event.activity_created_datetime))
                : "—",
            },
            {
              label: "Updated",
              value: event.activity_updated_datetime
                ? formatDate(new Date(event.activity_updated_datetime))
                : "—",
            },
          ]}
        />
      </WorkspaceShell>
    </ErrorBoundary>
  );
}
