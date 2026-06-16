import { notFound } from "next/navigation";
import { requireRoleCapability } from "@/modules/auth/session";
import { getApplicationDetail } from "./actions";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { StatusBadge } from "@/modules/workspace/StatusBadge";
import { genericStatusVariant } from "@/modules/workspace/status-mapping";
import Link from "next/link";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4 py-3">
      <dt
        className="w-32 shrink-0 text-sm font-medium pt-0.5"
        style={{ color: "var(--muted-foreground)" }}
      >
        {label}
      </dt>
      <dd className="text-sm" style={{ color: "var(--ink)" }}>
        {children}
      </dd>
    </div>
  );
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border p-6 space-y-2" style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}>
      <h3 className="text-base font-semibold mb-4" style={{ color: "var(--ink)" }}>
        {title}
      </h3>
      <dl className="divide-y" style={{ borderColor: "var(--border)" }}>
        {children}
      </dl>
    </section>
  );
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-KW", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function EmployerApplicationDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await requireRoleCapability("company", "company.read.linked");
  const result = await getApplicationDetail({ applicationId: Number(id) });

  if (!result.application) notFound();

  const app = result.application;

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Employer / Applications"
      title={`Application #${app.applicationId}`}
      metrics={[
        { label: "Status", value: app.status },
        { label: "Candidate", value: app.candidateName ?? "—" },
        { label: "Job", value: app.jobTitle },
      ]}
    >
      <div className="max-w-3xl space-y-6">
        <DetailSection title="Application Details">
          <DetailRow label="Application ID">
            <code className="text-xs font-mono" style={{ color: "var(--muted-foreground)" }}>
              #{app.applicationId}
            </code>
          </DetailRow>
          <DetailRow label="Job">
            <Link
              href={`/employer/jobs/${app.jobListingId}`}
              className="font-medium hover:underline"
              style={{ color: "var(--accent)" }}
            >
              {app.jobTitle}
            </Link>
          </DetailRow>
          <DetailRow label="Candidate">
            <span>{app.candidateName ?? <span style={{ color: "var(--muted-foreground)" }}>—</span>}</span>
          </DetailRow>
          <DetailRow label="Status">
            <StatusBadge
              variant={genericStatusVariant(app.status)}
              label={app.status}
              size="md"
            />
          </DetailRow>
          <DetailRow label="Applied">
            <span>{formatDate(app.createdAt)}</span>
          </DetailRow>
          <DetailRow label="Last Updated">
            <span>{formatDate(app.updatedAt)}</span>
          </DetailRow>
        </DetailSection>

        {app.coverLetter && (
          <DetailSection title="Cover Letter">
            <div className="whitespace-pre-wrap text-sm leading-relaxed" style={{ color: "var(--ink)" }}>
              {app.coverLetter}
            </div>
          </DetailSection>
        )}

        {app.notes && (
          <DetailSection title="Notes">
            <div className="whitespace-pre-wrap text-sm leading-relaxed" style={{ color: "var(--ink)" }}>
              {app.notes}
            </div>
          </DetailSection>
        )}

        <div className="flex gap-3 pt-2">
          <Link
            href={`/employer/applications`}
            className="inline-flex items-center gap-2 h-10 rounded-lg px-4 text-sm font-semibold transition-colors"
            style={{ background: "var(--surface)", color: "var(--ink)" }}
          >
            Back to Applications
          </Link>
          <Link
            href={`/employer/jobs/${app.jobListingId}/applications`}
            className="inline-flex items-center gap-2 h-10 rounded-lg px-4 text-sm font-semibold transition-colors"
            style={{ background: "var(--surface)", color: "var(--ink)" }}
          >
            View Job Applications
          </Link>
        </div>
      </div>
    </WorkspaceShell>
  );
}
