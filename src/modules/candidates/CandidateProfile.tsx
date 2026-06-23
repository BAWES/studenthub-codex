import type { Route } from "next";
import Link from "next/link";
import type { getCandidateDetail } from "@/modules/workspace/data";
import { formatDate } from "@/modules/workspace/format";
import { WorkLogStaffActions } from "./WorkLogStaffActions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
      <section className="candidateProfile empty">
        <strong>No candidate selected</strong>
        <span>Select a production candidate to view profile, readiness, work history, notes, and documents.</span>
      </section>
    );
  }

  const readiness = buildReadiness(detail);
  const timeline = buildTimeline(detail);
  const status = candidate.approved === 0 ? "Needs review" : candidate.candidate_status === 10 ? "Active" : `Status ${candidate.candidate_status}`;
  const title = candidate.candidate_name_ar || candidate.candidate_name;
  const profileActions = [...actions, ...legacyProfileActions(detail)];

  return (
    <section className={compact ? "candidateProfile compact" : "candidateProfile"}>
      <header className="candidateProfileHero">
        <div className="candidateAvatar" aria-hidden="true">
          {initials(candidate.candidate_name)}
        </div>
        <div className="candidateProfileTitle">
          <span>{candidate.candidate_uid ?? `#${candidate.candidate_id}`}</span>
          <h2>{candidate.candidate_name}</h2>
          {title !== candidate.candidate_name ? <p>{title}</p> : null}
          <div className="candidateStatusLine">
            <strong>{status}</strong>
            <span>{candidate.store?.company?.company_name ?? candidate.country?.country_name_en ?? "No company context"}</span>
          </div>
        </div>
      </header>

      <div className="candidateProfileActions" aria-label="Candidate actions">
        {backHref ? <Link href={backHref}>Back to list</Link> : null}
        {profileActions.map((action) =>
          action.href.startsWith("/") ? (
            <Link href={action.href as Route} key={`${action.label}-${action.href}`}>
              {action.label}
            </Link>
          ) : (
            <a href={action.href} key={`${action.label}-${action.href}`}>
              {action.label}
            </a>
          )
        )}
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-sm font-semibold">Readiness</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-3xl font-bold">{readiness.score}%</span>
            <span className="text-sm text-muted-foreground">{readiness.summary}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {readiness.items.map((item) => (
              <div key={item.label} className={`flex items-center gap-1.5 text-sm ${item.done ? "text-muted-foreground" : "text-destructive"}`}>
                <span className="text-xs">{item.done ? "✓" : "○"}</span>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
          {readiness.missing?.length ? (
            <div className="mt-3 pt-3 border-t border-border">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Missing fields</span>
              <ul className="flex flex-wrap gap-1.5 mt-1">
                {readiness.missing.map((item) => (
                  <li key={item.label}>
                    <Link href="/candidate/edit" className="text-xs text-primary hover:underline">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
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
        </CardContent>
      </Card>

      <CivilIdPanel candidate={candidate} viewerRole={viewerRole} />

      {!compact && candidate.candidate_intro ? (
        <section className="candidateNarrative">
          <span>Profile intro</span>
          <p>{candidate.candidate_intro}</p>
        </section>
      ) : null}

      <section className="candidateProfileColumns">
        <section className="candidateProfilePanel">
          <PanelHeader title="Skills and tags" count={detail.skills.length + detail.tags.length} />
          <div className="candidatePills">
            {[...detail.skills, ...detail.tags].slice(0, compact ? 12 : 28).map((item) => (
              <span key={`${item.title}-${item.id}`}>{item.title}</span>
            ))}
            {!detail.skills.length && !detail.tags.length ? <small>No imported skills or tags.</small> : null}
          </div>
        </section>

        <RowsPanel title="Timeline" rows={timeline} limit={compact ? 5 : 12} />
      </section>

      {!compact ? (
        <section className="candidateProfileColumns">
          <RowsPanel title="Education" rows={detail.education} />
          <RowsPanel title="Experience" rows={detail.experiences} />
          <RowsPanel title="Applications" rows={detail.applications} />
          <RowsPanel title="Interviews" rows={detail.interviews} />
          <RowsPanel title="Suggestions" rows={detail.suggestions} />
          <RowsPanel title="Invitations" rows={detail.invitations} />
          <RowsPanel title="Work history" rows={detail.histories} />
          {viewerRole === "staff" ? (
            <WorkLogStaffPanel hours={detail.workHours as any} />
          ) : (
            <RowsPanel title="Work logs" rows={detail.workHours} />
          )}
          <RowsPanel title="Notes" rows={detail.notes} />
          <RowsPanel title="Warnings" rows={detail.warnings} />
          <RowsPanel title="Documents and links" rows={[...detail.idCards, ...detail.certificates, ...detail.links]} />
        </section>
      ) : null}
    </section>
  );
}

function Fact({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="space-y-0.5">
      <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">{label}</span>
      <strong className="block text-sm font-semibold truncate">{value}</strong>
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
    <Card className="overflow-hidden">
      <CardHeader className="py-3 px-4 border-b border-border">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold">Civil ID</CardTitle>
          <Badge variant={badges.length ? "warning" : "secondary"} className="text-xs">
            {badges.length ? badges.join(" · ") : "On file"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">ID Number</span>
            <strong className="block text-sm font-semibold">{candidate.candidate_civil_id || "—"}</strong>
          </div>
          <div>
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">Expiry date</span>
            <strong className={`block text-sm font-semibold ${isExpired ? "text-destructive" : isNearExpiry ? "text-amber-500" : ""}`}>
              {expiryDate ? formatDate(expiryDate) : "—"}
            </strong>
          </div>
        </div>
        {candidate.candidate_civil_photo_front || candidate.candidate_civil_photo_back ? (
          <div className="grid grid-cols-2 gap-3">
            {candidate.candidate_civil_photo_front ? (
              <div>
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">Photo (front)</span>
                <img src={candidate.candidate_civil_photo_front} alt="Civil ID front" loading="lazy" className="mt-1 rounded-md border border-border" />
              </div>
            ) : null}
            {candidate.candidate_civil_photo_back ? (
              <div>
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">Photo (back)</span>
                <img src={candidate.candidate_civil_photo_back} alt="Civil ID back" loading="lazy" className="mt-1 rounded-md border border-border" />
              </div>
            ) : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function PanelHeader({ title, count }: { title: string; count: number }) {
  return (
    <CardHeader className="py-3 px-4 border-b border-border">
      <div className="flex items-center justify-between">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
        <Badge variant="secondary" className="text-xs">{count}</Badge>
      </div>
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
    <Card className="overflow-hidden">
      <PanelHeader title={title} count={rows.length} />
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {rows.slice(0, limit).map((row) =>
            row.href ? (
              row.href.startsWith("/") ? (
                <Link href={row.href as Route} key={`${title}-${row.id}`} className="block px-4 py-3 hover:bg-muted/50 transition-colors no-underline">
                  <RowContent row={row} />
                </Link>
              ) : (
                <a href={row.href} key={`${title}-${row.id}`} className="block px-4 py-3 hover:bg-muted/50 transition-colors no-underline">
                  <RowContent row={row} />
                </a>
              )
            ) : (
              <article key={`${title}-${row.id}`} className="px-4 py-3">
                <RowContent row={row} />
              </article>
            )
          )}
          {!rows.length ? <div className="px-4 py-6 text-center text-sm text-muted-foreground">No imported rows visible for this login.</div> : null}
        </div>
      </CardContent>
    </Card>
  );
}

function RowContent({ row }: { row: { title: string; subtitle: string; meta?: string } }) {
  return (
    <>
      <strong>{row.title}</strong>
      <span>{row.subtitle}</span>
      {row.meta ? <small>{row.meta}</small> : null}
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

function WorkLogStaffPanel({ hours }: { hours: WorkLogRow[] }) {
  return (
    <Card className="overflow-hidden">
      <PanelHeader title="Work logs" count={hours.length} />
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {hours.slice(0, 8).map((hour) => (
            <div key={`worklog-${hour.id}`} className="px-4 py-3 flex items-center justify-between gap-3">
              <RowContent row={hour} />
              <WorkLogStaffActions workLogUuid={String(hour.id)} currentStatus={hour.status} />
            </div>
          ))}
          {!hours.length ? <div className="px-4 py-6 text-center text-sm text-muted-foreground">No work log records for this candidate.</div> : null}
        </div>
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
    : score >= 60 ? "Usable with cleanup — fill in the open fields below"
    : "Needs attention — complete the missing fields to improve your profile visibility";
  const missing = items.filter((item) => !item.done).map((item) => ({ label: item.field ?? item.label }));
  return { items, missing, score, summary };
}

function buildTimeline(detail: CandidateDetailData) {
  return [
    ...detail.suggestions.map((row) => ({ ...row, title: `Suggested · ${row.title}` })),
    ...detail.applications.map((row) => ({ ...row, title: `Applied · ${row.title}` })),
    ...detail.interviews.map((row) => ({ ...row, title: `Interview · ${row.title}` })),
    ...detail.invitations.map((row) => ({ ...row, title: `Invitation · ${row.title}` })),
    ...detail.histories.map((row) => ({ ...row, title: `Assignment · ${row.title}` })),
    ...detail.workHours.map((row) => ({ ...row, title: `Work log · ${row.title}` })),
    ...detail.notes.map((row) => ({ ...row, title: `Note · ${row.title}` }))
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
