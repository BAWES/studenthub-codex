import { Suspense } from "react";
import { notFound } from "next/navigation";
import { requireRoleCapability } from "@/modules/auth/session";
import { RequestFulfillmentOS } from "@/modules/requests/RequestFulfillmentOS";
import { RequestActionBar } from "@/modules/requests/RequestActionBar";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { getRequestDetail } from "@/modules/workspace/data";

export const dynamic = "force-dynamic";

export default async function AdminRequestDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notice?: string }>;
}) {
  const session = await requireRoleCapability("admin", "request.read.any");
  const { id } = await params;
  const { notice } = await searchParams;
  const data = await getRequestDetail(id);

  if (!data.request) {
    notFound();
  }

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin / Request"
      title={data.request.request_position_title ?? "Untitled request"}
      metrics={data.metrics}
    >
      <Suspense fallback={null}>
        <RequestActionBar
          requestUuid={data.request.request_uuid}
          currentStatus={data.request.request_status as string | null}
          currentStaffId={data.request.staff?.staff_name ? (data.request as any).staff_id : null}
          currentTitle={data.request.request_position_title}
          role="admin"
          basePath="/admin/requests"
        />
      </Suspense>
      <RequestFulfillmentOS basePath="/admin/requests" data={data} notice={notice} role="admin" />
    </WorkspaceShell>
  );
}
