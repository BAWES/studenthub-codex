import { notFound } from "next/navigation";
import { requireRole } from "@/modules/auth/session";
import { RequestFulfillmentOS } from "@/modules/requests/RequestFulfillmentOS";
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
  const session = await requireRole("admin");
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
      <RequestFulfillmentOS basePath="/admin/requests" data={data} notice={notice} role="admin" />
    </WorkspaceShell>
  );
}
