import { Suspense } from "react";
import { notFound } from "next/navigation";
import { requireRoleCapability } from "@/modules/auth/session";
import { RequestFulfillmentOS } from "@/modules/requests/RequestFulfillmentOS";
import { RequestActionBar } from "@/modules/requests/RequestActionBar";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { getRequestDetail } from "@/modules/workspace/data";

export const dynamic = "force-dynamic";

export default async function StaffRequestDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notice?: string }>;
}) {
  const session = await requireRoleCapability("staff", "request.read.assigned");
  const { id } = await params;
  const { notice } = await searchParams;
  const data = await getRequestDetail(id, Number(session.id));

  if (!data.request) {
    notFound();
  }

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Staff / Request"
      title={data.request.request_position_title ?? "Untitled request"}
      metrics={data.metrics}
    >
      <Suspense fallback={null}>
        <RequestActionBar
          requestUuid={data.request.request_uuid}
          currentStatus={data.request.request_status as string | null}
          currentTitle={data.request.request_position_title}
          role="staff"
          basePath="/staff/requests"
        />
      </Suspense>
      <RequestFulfillmentOS basePath="/staff/requests" data={data} notice={notice} role="staff" />
    </WorkspaceShell>
  );
}
