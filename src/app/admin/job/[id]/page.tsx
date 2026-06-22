import { ErrorBoundary } from "@/modules/workspace/ErrorBoundary";
import { notFound } from "next/navigation";
import { requireRoleCapability } from "@/modules/auth/session";
import { DetailSection } from "@/modules/workspace/DetailPanels";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { getJob } from "./actions";
import { formatDate } from "@/modules/workspace/format";

export const dynamic = "force-dynamic";

export default async function AdminJobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRoleCapability("admin", "admin.read");
  const { id } = await params;

  const data = await getJob({ jobUuid: id });

  if (!data.job) {
    notFound();
  }

  const job = data.job;

  return (
    <ErrorBoundary>
      <WorkspaceShell
        session={session}
        eyebrow="Admin / Jobs"
        title={job.position}
        metrics={[]}
      >
        <DetailSection
          title="Job Details"
          facts={[
            { label: "Position (English)", value: job.position },
            { label: "Position (Arabic)", value: job.position_ar ?? "—" },
            { label: "Description", value: job.description ?? "—" },
            { label: "Status", value: job.status ? "Active" : "Inactive" },
            {
              label: "Hours / day",
              value: job.hours_per_day != null ? `${job.hours_per_day}h` : "—",
            },
            {
              label: "Days / week",
              value: job.days_per_week != null ? (job.days_per_week ? "Yes" : "No") : "—",
            },
            {
              label: "Compensation",
              value: job.compensation_type
                ? `${job.compensation_type}${job.compensation_amount ? ` (${job.compensation_amount})` : ""}`
                : "—",
            },
            { label: "Comp. description", value: job.compensation_description ?? "—" },
            {
              label: "Age range",
              value:
                job.min_age != null || job.max_age != null
                  ? `${job.min_age ?? "—"} – ${job.max_age ?? "—"}`
                  : "—",
            },
            {
              label: "Gender requirement",
              value: job.gender != null ? (job.gender ? "Male" : "Female") : "—",
            },
            { label: "Area UUID", value: job.area_uuid ?? "—" },
            { label: "Request UUID", value: job.request_uuid },
          ]}
        />
        <DetailSection
          title="Availability"
          facts={[
            {
              label: "Available from",
              value: job.available_from
                ? formatDate(new Date(job.available_from))
                : "—",
            },
            {
              label: "Available to",
              value: job.available_to
                ? formatDate(new Date(job.available_to))
                : "—",
            },
          ]}
        />
        <DetailSection
          title="Timestamps"
          facts={[
            {
              label: "Created",
              value: job.created_at
                ? formatDate(new Date(job.created_at))
                : "—",
            },
            {
              label: "Updated",
              value: job.updated_at
                ? formatDate(new Date(job.updated_at))
                : "—",
            },
            {
              label: "Deleted",
              value: job.deleted_at
                ? formatDate(new Date(job.deleted_at))
                : "—",
            },
          ]}
        />
      </WorkspaceShell>
    </ErrorBoundary>
  );
}
