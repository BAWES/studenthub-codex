import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { requireSession } from "@/modules/auth/session";
import { RequestFulfillmentOS } from "@/modules/requests/RequestFulfillmentOS";
import { RequestActionBar } from "@/modules/requests/RequestActionBar";
import { CompactList, FactPanel } from "@/modules/workspace/DetailPanels";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { getRequestDetail, getCompanyRequestDetail } from "@/modules/workspace/data";
import { formatDate } from "@/modules/workspace/format";

export const dynamic = "force-dynamic";

export default async function AppRequestDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notice?: string }>;
}) {
  const session = await requireSession();
  const { id } = await params;
  const { notice } = await searchParams;

  if (session.role === "staff") {
    const data = await getRequestDetail(id, Number(session.id));
    if (!data.request) notFound();

    return (
      <WorkspaceShell
        session={session}
        eyebrow="Requests"
        title={data.request.request_position_title ?? "Untitled request"}
        metrics={data.metrics}
      >
        <Suspense fallback={null}>
          <RequestActionBar
            requestUuid={data.request.request_uuid}
            currentStatus={data.request.request_status as string | null}
            currentTitle={data.request.request_position_title}
            role="staff"
            basePath="/app/requests"
          />
        </Suspense>
        <RequestFulfillmentOS basePath="/app/requests" data={data} notice={notice} role="staff" />
      </WorkspaceShell>
    );
  }

  if (session.role === "admin") {
    const data = await getRequestDetail(id);
    if (!data.request) notFound();

    return (
      <WorkspaceShell
        session={session}
        eyebrow="Requests"
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
            basePath="/app/requests"
          />
        </Suspense>
        <RequestFulfillmentOS basePath="/app/requests" data={data} notice={notice} role="admin" />
      </WorkspaceShell>
    );
  }

  if (session.role === "company") {
    const data = await getCompanyRequestDetail(session.id, id);
    if (!data?.request) notFound();

    return (
      <WorkspaceShell
        session={session}
        eyebrow="Requests"
        title={data.request.request_position_title ?? "Untitled request"}
        metrics={data.metrics}
        primary={{ title: "Applications", rows: data.applications }}
        secondary={{ title: "Invitations", rows: data.invitations }}
      >
        <FactPanel
          title="Request Brief"
          facts={[
            { label: "Company", value: data.request.company?.company_name },
            { label: "Contact", value: data.request.contact?.contact_name },
            { label: "Owner", value: data.request.staff?.staff_name },
            { label: "Compensation", value: data.request.request_compensation },
            { label: "Location", value: data.request.request_location },
            { label: "Created", value: formatDate(data.request.request_created_datetime) },
            { label: "Updated", value: formatDate(data.request.request_updated_datetime) }
          ]}
        />
        <section className="detailGrid">
          <CompactList title="Interviews" rows={data.interviews} />
          <CompactList title="Stories" rows={data.stories} />
        </section>
      </WorkspaceShell>
    );
  }

  redirect("/app");
}
