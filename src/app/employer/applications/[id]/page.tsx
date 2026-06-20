import { notFound } from "next/navigation";
import { requireRoleCapability } from "@/modules/auth/session";
import { getApplicationDetail } from "./actions";
import { acceptApplication, rejectApplication, revertApplicationStatus } from "./actions.server";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { StatusBadge } from "@/modules/workspace/StatusBadge";
import { genericStatusVariant } from "@/modules/workspace/status-mapping";
import { APPLICATION_STATUS_LABELS } from "@/modules/status-labels";
import Link from "next/link";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4 py-3">
      <dt
        className="w-32 shrink-0 text-sm font-medium pt-0.5 text-muted-foreground"
      >
        {label}
      </dt>
      <dd className="text-sm text-foreground">
        {children}
      </dd>
    </div>
  );
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-card p-6 space-y-2">
      <h3 className="text-base font-semibold mb-4 text-foreground">
        {title}
      </h3>
      <dl className="divide-y divide-border">
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

const ACCEPT_REJECT_STATUSES = new Set(["applied", "reviewing", "shortlisted", "interviewed"]);

export default async function EmployerApplicationDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await requireRoleCapability("company", "company.read.linked");
  const result = await getApplicationDetail({ applicationId: Number(id) });

  if (!result.application) notFound();

  const app = result.application;
  const canAcceptReject = ACCEPT_REJECT_STATUSES.has(app.status);
  const canRevert = app.status === "accepted" || app.status === "rejected";

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Employer / Applications"
      title={`Application #${app.applicationId}`}
      metrics={[
        { label: "Status", value: app.status, note: "" },
        { label: "Candidate", value: app.candidateName ?? "—", note: "" },
        { label: "Job", value: app.jobTitle, note: "" },
      ]}
    >
      <div className="max-w-3xl space-y-6">
        <DetailSection title="Application Details">
          <DetailRow label="Application ID">
            <code className="text-xs font-mono text-muted-foreground">
              #{app.applicationId}
            </code>
          </DetailRow>
          <DetailRow label="Job">
            <Link
              href={`/employer/jobs/${app.jobListingId}`}
              className="font-medium hover:underline text-accent"
            >
              {app.jobTitle}
            </Link>
          </DetailRow>
          <DetailRow label="Candidate">
            <span>{app.candidateName ?? <span className="text-muted-foreground">—</span>}</span>
          </DetailRow>
          <DetailRow label="Status">
            <StatusBadge
              variant={genericStatusVariant(app.status)}
              label={APPLICATION_STATUS_LABELS[app.status] ?? app.status}
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
            <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
              {app.coverLetter}
            </div>
          </DetailSection>
        )}

        {app.notes && (
          <DetailSection title="Notes">
            <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
              {app.notes}
            </div>
          </DetailSection>
        )}

        <div className="space-y-4">
          {/* Accept / Reject actions */}
          {canAcceptReject && (
            <div className="flex gap-3">
              <form action={acceptApplication}>
                <input type="hidden" name="applicationId" value={app.applicationId} />
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 h-10 rounded-lg px-5 text-sm font-semibold transition-colors bg-accent text-white"
                >
                  Accept Application
                </button>
              </form>
              <form action={rejectApplication}>
                <input type="hidden" name="applicationId" value={app.applicationId} />
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 h-10 rounded-lg px-5 text-sm font-semibold transition-colors bg-destructive text-white"
                >
                  Reject Application
                </button>
              </form>
            </div>
          )}

          {/* Revert action for accepted/rejected applications */}
          {canRevert && (
            <form action={revertApplicationStatus}>
              <input type="hidden" name="applicationId" value={app.applicationId} />
              <button
                type="submit"
                className="inline-flex items-center gap-2 h-10 rounded-lg px-5 text-sm font-semibold transition-colors bg-card text-foreground"
              >
                Revert to Reviewing
              </button>
            </form>
          )}

          {/* Navigation links */}
          <div className="flex gap-3 pt-2">
            <Link
              href="/employer/applications"
              className="inline-flex items-center gap-2 h-10 rounded-lg px-4 text-sm font-semibold transition-colors bg-card text-foreground"
            >
              Back to Applications
            </Link>
            <Link
              href={`/employer/jobs/${app.jobListingId}/applications`}
              className="inline-flex items-center gap-2 h-10 rounded-lg px-4 text-sm font-semibold transition-colors bg-card text-foreground"
            >
              View Job Applications
            </Link>
          </div>
        </div>
      </div>
    </WorkspaceShell>
  );
}
