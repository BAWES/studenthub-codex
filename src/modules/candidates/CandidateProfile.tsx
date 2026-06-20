import type { Route } from "next";
import Link from "next/link";
import type { getCandidateDetail } from "@/modules/candidates/candidate-detail";
import { formatDate } from "@/modules/workspace/format";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/modules/workspace/EmptyState";
import { StatusBadge } from "@/modules/workspace/StatusBadge";
import { WorkLogStaffActions } from "./WorkLogStaffActions";

/** Maps numeric candidate_status to a human-readable label. */
function candidateStatusLabel(status: number | null | undefined, approved: number | null | undefined): string {
  if (approved === 0) return "Needs review";
  switch (status) {
    case 10: return "Active";
    case 5:  return "Inactive";
    case 0:  return "Archived";
    default: return status != null ? `Status ${status}` : "Unknown";
  }
}

type CandidateDetailData = Awaited<ReturnType<typeof getCandidateDetail>>;

type CandidateAction = {
  label: string;
  href: string;
};

export function CandidateProfile({
  detail,
  actions,
  backHref,
  compact = false,
  viewerRole
}: {
  detail: CandidateDetailData | null;
  actions: CandidateAction[];
  backHref?: Route;
  compact?: boolean;
  viewerRole?: string;
}) {
  const candidate = detail?.candidate;
  if (!candidate) {
    return (
      <section className="grid content-center justify-items-center gap-2 min-h-[360px] p-6 text-center">
        <EmptyState variant="no-data" message="No candidate selected" hint="Select a production candidate to view profile, readiness, work history, notes, and documents." />
      </section>
    );
  }

  const readiness = buildReadiness(detail);
  const timeline = buildTimeline(detail);
  const status = candidateStatusLabel(candidate.candidate_status, candidate.approved);
  const title = candidate.candidate_name_ar || candidate.candidate_name;
  const profileActions = [...actions, ...legacyProfileActions(detail)];

  return (
    <section className="grid content-start gap-[10px]">
      {/* Hero Card */}
      <Card>
        <header className="grid grid-cols-[64px_1fr] gap-[14px] items-center p-4 border-b border-border">
          <div
            className="flex items-center justify-center w-16 h-16 rounded-full bg-muted text-lg font-bold text-muted-foreground"
            aria-hidden="true"
          >
            {initials(candidate.candidate_name)}
          </div>
          <div className="grid gap-1 min-w-0">
            <p className="text-[11px] font-black uppercase text-primary m-0">
              {candidate.candidate_uid ?? `#${candidate.candidate_id}`}
            </p>
            <h2 className="text-[clamp(28px,3vw,44px)] leading-[0.98] font-bold m-0 break-words">
              {candidate.candidate_name}
            </h2>
            {title !== candidate.candidate_name ? (
              <p className="text-sm text-muted-foreground m-0">{title}</p>
            ) : null}
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <StatusBadge
                variant={status === "Active" ? "success" : status === "Archived" ? "error" : "warning"}
                size="sm"
                label={status}
                glow
              />
              <span className="text-xs text-muted-foreground">
                {candidate.store?.company?.company_name ?? candidate.country?.country_name_en ?? "No company context"}
              </span>
            </div>
          </div>
        </header>

        {/* Action bar */}
        <div className="flex flex-wrap gap-2 px-4 pb-3.5" aria-label="Candidate actions">
          {backHref ? (
            <Link href={backHref} className={buttonVariants({ variant: "outline", size: "sm" })}>
              Back to list
            </Link>
          ) : null}
          {profileActions.map((action) => {
            const isFirst = !backHref && profileActions.indexOf(action) === 0;
            return action.href.startsWith("/") ? (
              <Link
                href={action.href as Route}
                key={`${action.label}-${action.href}`}
                className={buttonVariants({ variant: isFirst ? "default" : "outline", size: "sm" })}
              >
                {action.label}
              </Link>
            ) : (
              <a
                href={action.href}
                key={`${action.label}-${action.href}`}
                className={buttonVariants({ variant: isFirst ? "default" : "outline", size: "sm" })}
                target="_blank"
                rel="noopener noreferrer"
              >
                {action.label}
              </a>
            );
          })}
        </div>
      </Card>

      {/* Readiness Card */}
      <Card>
        <CardContent className="p-4">
          <section aria-label="Candidate readiness">
            <div className="grid grid-cols-[150px_1fr] gap-[10px]">
              <div className="grid content-center gap-1 border border-border rounded-lg bg-card p-3">
                <span className="text-[11px] font-black uppercase text-primary">Readiness</span>
                <strong className="text-[34px] leading-none font-bold">{readiness.score}%</strong>
                <small className="text-xs text-muted-foreground leading-snug">{readiness.summary}</small>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {readiness.items.map((item) => (
                  <div
                    key={item.label}
                    className="grid gap-0.5 border border-border rounded-lg bg-muted/50 p-2 min-w-0"
                  >
                    <span className={`text-[11px] font-black uppercase ${item.done ? "text-green-600" : "text-rose-600"}`}>
                      {item.done ? "Done" : "Open"}
                    </span>
                    <strong className="truncate text-sm">{item.label}</strong>
                  </div>
                ))}
              </div>
            </div>
            {readiness.missing?.length ? (
              <div className="grid gap-1 mt-3 pt-3 border-t border-border">
                <span className="text-[11px] font-black uppercase text-primary">Missing fields</span>
                <ul className="list-none m-0 p-0 grid gap-1">
                  {readiness.missing.map((item) => (
                    <li key={item.label}>
                      <Link href="/candidate/edit" className="text-sm text-primary hover:underline">
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </section>
        </CardContent>
      </Card>

      {/* Fact Grid */}
      <Card>
        <div className="grid grid-cols-2">
          <Fact label="Email" value={candidate.candidate_email} />
          <Fact label="Phone" value={candidate.candidate_phone ?? "No phone"} />
          <Fact label="Country" value={candidate.country?.country_name_en ?? "Not set"} />
          <Fact label="University" value={candidate.university?.university_name_en ?? "Not set"} />
          <Fact label="Company" value={candidate.store?.company?.company_name ?? "Not assigned"} />
          <Fact label="Store" value={candidate.store?.store_name ?? "Not assigned"} />
          <Fact label="Rate" value={detail.metrics[1]?.value ?? "0"} />
          <Fact label="Revenue" value={detail.stats?.totalRevenue ?? "No revenue stats"} />
          <Fact label="Civil ID" value={candidate.candidate_civil_id ?? (candidate.candidate_civil_need_verification ? "Needs verification" : "Not set")} />
          <Fact label="Updated" value={formatDate(candidate.candidate_updated_at)} />
        </div>
      </Card>

      {/* Civil ID Card */}
      <CivilIdPanel candidate={candidate} viewerRole={viewerRole} />

      {/* Profile Intro */}
      {!compact && candidate.candidate_intro ? (
        <Card>
          <CardContent className="p-4">
            <section className="grid gap-1.5">
              <span className="text-[11px] font-black uppercase text-primary">Profile intro</span>
              <p className="text-sm text-muted-foreground leading-relaxed m-0 max-w-[980px]">
                {candidate.candidate_intro}
              </p>
            </section>
          </CardContent>
        </Card>
      ) : null}

      {/* Skills & Tags Panel */}
      <div className="grid grid-cols-2 gap-[10px] px-0 pb-4">
        <Card className="h-min">
          <PanelHeader title="Skills and tags" count={detail.skills.length + detail.tags.length} />
          <CardContent className="p-3">
            <div className="flex flex-wrap gap-2">
              {[...detail.skills, ...detail.tags].slice(0, compact ? 12 : 28).map((item) => (
                <Badge key={`${item.title}-${item.id}`} variant="secondary" className="font-extrabold text-xs">
                  {item.title}
                </Badge>
              ))}
              {!detail.skills.length && !detail.tags.length ? (
                <EmptyState variant="empty" message="No imported skills or tags" hint="Skills and tags will appear here once they are imported from the candidate profile." />
              ) : null}
            </div>
          </CardContent>
        </Card>

        <Card className="h-min">
          <RowsPanel title="Timeline" rows={timeline} limit={compact ? 5 : 12} />
        </Card>
      </div>

      {/* Detail Panels */}
      {!compact ? (
        <div className="grid grid-cols-2 gap-[10px] px-0 pb-4">
          <DetailCard title="Education" rows={detail.education} />
          <DetailCard title="Experience" rows={detail.experiences} />
          <DetailCard title="Applications" rows={detail.applications} />
          <DetailCard title="Interviews" rows={detail.interviews} />
          <DetailCard title="Suggestions" rows={detail.suggestions} />
          <DetailCard title="Invitations" rows={detail.invitations} />
          <DetailCard title="Work history" rows={detail.histories} />
          {viewerRole === "staff" ? (
            <WorkLogStaffCard hours={detail.workHours as any} />
          ) : (
            <DetailCard title="Work logs" rows={detail.workHours} />
          )}
          <DetailCard title="Notes" rows={detail.notes} />
          <DetailCard title="Warnings" rows={detail.warnings} />
          <DetailCard title="Documents and links" rows={[...detail.idCards, ...detail.certificates, ...detail.links]} />
        </div>
      ) : null}
    </section>
  );
}

/* Sub-components */

function Fact({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="grid gap-1 min-w-0 p-[11px_16px] border-r border-b border-border odd:border-r even:border-r-0 [&:nth-last-child(-n+2)]:border-b-0">
      <span className="text-[11px] font-black uppercase text-primary">{label}</span>
      <strong className="text-sm font-semibold break-words">{value}</strong>
    </div>
  );
}

function CivilIdPanel({ candidate, viewerRole }: { candidate: NonNullable<CandidateDetailData["candidate"]>; viewerRole?: string }) {
  if (!candidate.candidate_civil_id && !candidate.candidate_civil_expiry_date && !candidate.candidate_civil_photo_front && !candidate.candidate_civil_photo_back && !candidate.candidate_civil_need_verification) {
    return null;
  }

  const now = new Date();
  const expiryDate = candidate.candidate_civil_expiry_date ? new Date(candidate.candidate_civil_expiry_date) : null;
  const daysUntilExpiry = expiryDate ? Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null;
  const isExpired = daysUntilExpiry !== null && daysUntilExpiry < 0;
  const isNearExpiry = daysUntilExpiry !== null && daysUntilExpiry >= 0 && daysUntilExpiry <= 90;

  const badges: string[] = [];
  if (candidate.candidate_civil_need_verification) badges.push("Needs verification");
  if (isExpired) badges.push("Expired");
  else if (isNearExpiry) badges.push("Expires soon");

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 p-3 border-b border-border">
        <span className="text-[11px] font-black uppercase text-primary">Civil ID</span>
        <strong className="text-xs">{badges.length ? badges.join(" \u00b7 ") : "On file"}</strong>
      </CardHeader>
      <CardContent className="grid gap-3 p-3">
        <div className="grid grid-cols-2 gap-[10px]">
          <div className="grid gap-1 min-w-0">
            <span className="text-xs text-muted-foreground">ID Number</span>
            <strong className="text-sm font-semibold break-words">{candidate.candidate_civil_id || "\u2014"}</strong>
          </div>
          <div className="grid gap-1 min-w-0">
            <span className="text-xs text-muted-foreground">Expiry date</span>
            <strong className={`text-sm font-semibold ${isExpired ? "text-destructive" : isNearExpiry ? "text-amber-600" : ""}`}>
              {expiryDate ? formatDate(expiryDate) : "\u2014"}
            </strong>
          </div>
        </div>
        {candidate.candidate_civil_photo_front || candidate.candidate_civil_photo_back ? (
          <div className="grid grid-cols-2 gap-[10px] max-sm:grid-cols-1">
            {candidate.candidate_civil_photo_front ? (
              <div className="grid gap-1 min-w-0">
                <span className="text-xs text-muted-foreground">Photo (front)</span>
                <img src={candidate.candidate_civil_photo_front} alt="Civil ID front" loading="lazy" className="max-w-full h-auto border border-border rounded aspect-[16/10] object-cover" />
              </div>
            ) : null}
            {candidate.candidate_civil_photo_back ? (
              <div className="grid gap-1 min-w-0">
                <span className="text-xs text-muted-foreground">Photo (back)</span>
                <img src={candidate.candidate_civil_photo_back} alt="Civil ID back" loading="lazy" className="max-w-full h-auto border border-border rounded aspect-[16/10] object-cover" />
              </div>
            ) : null}
          </div>
        ) : null}
        {candidate.candidate_civil_need_verification ? (
          <div className="pt-2 border-t border-border">
            <Button variant="destructive" size="sm">
              Clear verification flag
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function PanelHeader({ title, count }: { title: string; count: number }) {
  return (
    <CardHeader className="flex flex-row items-center justify-between gap-2 p-3 border-b border-border">
      <span className="text-[11px] font-black uppercase text-primary">{title}</span>
      <strong className="text-sm">{count.toLocaleString("en-US")}</strong>
    </CardHeader>
  );
}

function RowsPanel({
  title,
  rows,
  limit = 8
}: {
  title: string;
  rows: { id: string | number; title: string; subtitle: string; meta?: string; href?: string }[];
  limit?: number;
}) {
  return (
    <Card>
      <PanelHeader title={title} count={rows.length} />
      <CardContent className="p-3 grid gap-2">
        {rows.slice(0, limit).map((row) =>
          row.href ? (
            row.href.startsWith("/") ? (
              <Link href={row.href as Route} key={`${title}-${row.id}`} className="grid gap-1 p-[10px] border border-border rounded-lg bg-muted/50 hover:border-primary hover:bg-accent/50 transition-colors no-underline min-w-0">
                <RowContent row={row} />
              </Link>
            ) : (
              <a href={row.href} key={`${title}-${row.id}`} target="_blank" rel="noopener noreferrer" className="grid gap-1 p-[10px] border border-border rounded-lg bg-muted/50 hover:border-primary hover:bg-accent/50 transition-colors no-underline min-w-0">
                <RowContent row={row} />
              </a>
            )
          ) : (
            <article key={`${title}-${row.id}`} className="grid gap-1 p-[10px] border border-border rounded-lg bg-muted/50 min-w-0">
              <RowContent row={row} />
            </article>
          )
        )}
        {!rows.length ? <EmptyState variant="empty" message="No records yet" hint="Records will appear here once they are imported or linked to this profile." /> : null}
      </CardContent>
    </Card>
  );
}

function DetailCard({ title, rows }: { title: string; rows: { id: string | number; title: string; subtitle: string; meta?: string; href?: string }[] }) {
  return <RowsPanel title={title} rows={rows} />;
}

function RowContent({ row }: { row: { title: string; subtitle: string; meta?: string } }) {
  return (
    <>
      <strong className="truncate text-sm font-semibold">{row.title}</strong>
      <span className="truncate text-xs text-muted-foreground">{row.subtitle}</span>
      {row.meta ? <small className="truncate text-[11px] text-muted-foreground">{row.meta}</small> : null}
    </>
  );
}

type WorkLogRow = {
  id: string | number;
  title: string;
  subtitle: string;
  meta?: string;
  status: number;
};

function WorkLogStaffCard({ hours }: { hours: WorkLogRow[] }) {
  return (
    <Card>
      <PanelHeader title="Work logs" count={hours.length} />
      <CardContent className="p-3 grid gap-2">
        {hours.slice(0, 8).map((hour) => (
          <article key={`worklog-${hour.id}`} className="grid gap-1 p-[10px] border border-border rounded-lg bg-muted/50 min-w-0">
            <RowContent row={hour} />
            <WorkLogStaffActions workLogUuid={String(hour.id)} currentStatus={hour.status} />
          </article>
        ))}
        {!hours.length ? <EmptyState variant="empty" message="No work log records" hint="Work log records will appear here once the candidate has logged hours." /> : null}
      </CardContent>
    </Card>
  );
}

function buildReadiness(detail: CandidateDetailData) {
  const c = detail.candidate;
  const items = [
    { label: "Name", done: Boolean(c?.candidate_name), field: "Name (English)" },
    { label: "Email", done: Boolean(c?.candidate_email), field: "Email address" },
    { label: "Phone", done: Boolean(c?.candidate_phone), field: "Phone number" },
    { label: "Country", done: Boolean(c?.country_id), field: "Country / Nationality" },
    { label: "University", done: Boolean(c?.university_id), field: "University" },
    { label: "Objective", done: Boolean(c?.candidate_objective), field: "Objective / Headline" },
    { label: "Intro", done: Boolean(c?.candidate_intro), field: "Profile introduction" },
    { label: "Civil ID number", done: Boolean(c?.candidate_civil_id), field: "Civil ID number" },
    { label: "Civil ID photos", done: Boolean(c?.candidate_civil_photo_front || c?.candidate_civil_photo_back), field: "Civil ID photos (front/back)" },
    { label: "Profile photo", done: Boolean(c?.candidate_personal_photo), field: "Profile photo upload" },
    { label: "CV / Resume", done: Boolean(c?.candidate_resume), field: "CV / Resume upload" },
    { label: "Bank info", done: Boolean(c?.bank_id || c?.candidate_iban), field: "Bank name or IBAN" },
    { label: "Skills", done: detail.skills.length > 0, field: "At least one skill tag" },
    { label: "Education", done: detail.education.length > 0, field: "Education entries" },
    { label: "Experience", done: detail.experiences.length > 0, field: "Work experience entries" },
    { label: "Approved", done: Boolean(c && c.approved !== 0), field: "Staff approval" },
  ];
  const done = items.filter((item) => item.done).length;
  const score = Math.round((done / items.length) * 100);
  const summary =
    score >= 85 ? "Ready to present"
    : score >= 60 ? "Usable with cleanup \u2014 fill in the open fields below"
    : "Needs attention \u2014 complete the missing fields to improve your profile visibility";
  const missing = items.filter((item) => !item.done).map((item) => ({ label: item.field ?? item.label }));
  return { items, missing, score, summary };
}

function buildTimeline(detail: CandidateDetailData) {
  return [
    ...detail.suggestions.map((row) => ({ ...row, title: `Suggested \u00b7 ${row.title}` })),
    ...detail.applications.map((row) => ({ ...row, title: `Applied \u00b7 ${row.title}` })),
    ...detail.interviews.map((row) => ({ ...row, title: `Interview \u00b7 ${row.title}` })),
    ...detail.invitations.map((row) => ({ ...row, title: `Invitation \u00b7 ${row.title}` })),
    ...detail.histories.map((row) => ({ ...row, title: `Assignment \u00b7 ${row.title}` })),
    ...detail.workHours.map((row) => ({ ...row, title: `Work log \u00b7 ${row.title}` })),
    ...detail.notes.map((row) => ({ ...row, title: `Note \u00b7 ${row.title}` }))
  ].slice(0, 16);
}

function legacyProfileActions(detail: CandidateDetailData): CandidateAction[] {
  const candidate = detail.candidate;
  if (!candidate) return [];
  return [
    toAction("Resume", candidate.candidate_resume),
    toAction("Profile URL", candidate.profile_url),
    ...detail.links.slice(0, 2).map((link) => toAction(link.title, link.href))
  ].filter((action): action is CandidateAction => Boolean(action));
}

function toAction(label: string, href: string | undefined | null) {
  if (!href) return null;
  if (href.startsWith("http://") || href.startsWith("https://") || href.startsWith("/") || href.startsWith("mailto:") || href.startsWith("tel:")) {
    return { label, href };
  }
  return null;
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}
