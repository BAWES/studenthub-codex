import type { Route } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { getCandidateDetail } from "@/modules/workspace/data";
import { formatDate } from "@/modules/workspace/format";
import { WorkLogStaffActions } from "./WorkLogStaffActions";

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
      <Card className="min-h-[360px] flex flex-col items-center justify-center p-6 text-center">
        <CardTitle className="text-base">No candidate selected</CardTitle>
        <CardContent className="text-sm text-muted-foreground max-w-sm px-0 pt-2">
          Select a production candidate to view profile, readiness, work history, notes, and documents.
        </CardContent>
      </Card>
    );
  }

  const readiness = buildReadiness(detail);
  const timeline = buildTimeline(detail);
  const status = candidate.approved === 0 ? "Needs review" : candidate.candidate_status === 10 ? "Active" : `Status ${candidate.candidate_status}`;
  const title = candidate.candidate_name_ar || candidate.candidate_name;
  const profileActions = [...actions, ...legacyProfileActions(detail)];

  return (
    <section className="flex flex-col gap-3">
      {/* ── Hero header ── */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-4 border-b pb-4">
          <div
            className="w-16 h-16 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-lg font-bold shrink-0"
            aria-hidden="true"
          >
            {initials(candidate.candidate_name)}
          </div>
          <div className="min-w-0 flex flex-col gap-1">
            <span className="text-xs uppercase font-bold text-primary">
              {candidate.candidate_uid ?? `#${candidate.candidate_id}`}
            </span>
            <CardTitle className={`break-words leading-[0.98] ${compact ? "text-3xl" : "text-[clamp(28px,3vw,44px)]"}`}>
              {candidate.candidate_name}
            </CardTitle>
            {title !== candidate.candidate_name ? (
              <p className="text-sm text-muted-foreground m-0">{title}</p>
            ) : null}
            <div className="flex flex-wrap gap-2 items-center mt-1">
              <Badge variant={candidate.approved === 0 ? "warning" : "success"}>{status}</Badge>
              <span className="text-xs text-muted-foreground">
                {candidate.store?.company?.company_name ?? candidate.country?.country_name_en ?? "No company context"}
              </span>
            </div>
          </div>
        </CardHeader>

        {/* ── Action buttons ── */}
        {profileActions.length > 0 || backHref ? (
          <div className="flex flex-wrap gap-2 px-4 pb-4 border-b">
            {backHref ? (
              <Button variant="outline" size="sm" asChild>
                <Link href={backHref}>Back to list</Link>
              </Button>
            ) : null}
            {profileActions.map((action) =>
              action.href.startsWith("/") ? (
                <Button key={`${action.label}-${action.href}`} variant="outline" size="sm" asChild>
                  <Link href={action.href as Route}>{action.label}</Link>
                </Button>
              ) : (
                <Button key={`${action.label}-${action.href}`} variant="outline" size="sm" asChild>
                  <a href={action.href}>{action.label}</a>
                </Button>
              )
            )}
          </div>
        ) : null}

        {/* ── Readiness ── */}
        <CardContent className="border-b pb-4">
          <div className="grid grid-cols-1 sm:grid-cols-[150px_1fr] gap-3">
            <Card className="border p-3 bg-muted/30">
              <span className="text-xs uppercase font-bold text-primary">Readiness</span>
              <p className="text-3xl font-bold leading-none mt-1">{readiness.score}%</p>
              <p className="text-xs text-muted-foreground mt-1">{readiness.summary}</p>
            </Card>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {readiness.items.map((item) => (
                <Card key={item.label} className="border p-2">
                  <Badge variant={item.done ? "success" : "warning"} className="text-[10px] px-1 py-0">
                    {item.done ? "Done" : "Open"}
                  </Badge>
                  <p className="text-sm font-medium truncate mt-1">{item.label}</p>
                </Card>
              ))}
            </div>
          </div>
          {readiness.missing?.length ? (
            <Card className="border-amber-300 bg-amber-50 dark:bg-amber-950/10 mt-3 p-3">
              <span className="text-xs uppercase font-bold text-amber-700 dark:text-amber-400">Missing fields</span>
              <ul className="text-sm list-disc pl-4 mt-1 text-muted-foreground">
                {readiness.missing.map((item) => (
                  <li key={item.label}>
                    <Link href="/candidate/edit" className="text-primary underline">{item.label}</Link>
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}
        </CardContent>

        {/* ── Facts grid ── */}
        <CardContent className="grid grid-cols-2 border-b p-0">
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
        </CardContent>

        {/* ── Civil ID ── */}
        <CivilIdPanel candidate={candidate} viewerRole={viewerRole} />

        {/* ── Intro ── */}
        {!compact && candidate.candidate_intro ? (
          <CardContent className="pb-0">
            <Card className="border p-4">
              <span className="text-xs uppercase font-bold text-primary">Profile intro</span>
              <p className="text-sm text-muted-foreground mt-1 max-w-[980px] leading-relaxed">
                {candidate.candidate_intro}
              </p>
            </Card>
          </CardContent>
        ) : null}
      </Card>

      {/* ── Skills & timeline ── */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between border-b px-3 py-2.5">
            <span className="text-xs uppercase font-bold text-primary">Skills and tags</span>
            <span className="text-xs font-bold">{(detail.skills.length + detail.tags.length).toLocaleString("en-US")}</span>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2 p-3">
            {[...detail.skills, ...detail.tags].slice(0, compact ? 12 : 28).map((item) => (
              <Badge key={`${item.title}-${item.id}`} variant="secondary" className="text-xs">
                {item.title}
              </Badge>
            ))}
            {!detail.skills.length && !detail.tags.length ? (
              <small className="text-xs text-muted-foreground">No imported skills or tags.</small>
            ) : null}
          </CardContent>
        </Card>

        <RowsPanel title="Timeline" rows={timeline} limit={compact ? 5 : 12} />
      </div>

      {/* ── Detail panels ── */}
      {!compact ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
        </div>
      ) : null}
    </section>
  );
}

function Fact({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="min-w-0 flex flex-col gap-1.5 border-r border-b p-3 odd:border-r even:border-r-0">
      <span className="text-xs uppercase font-bold text-primary">{label}</span>
      <strong className="text-sm break-words">{value}</strong>
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
    <Card className="mx-0 border-t-0 border-x-0 rounded-none shadow-none">
      <CardHeader className="flex flex-row items-center justify-between border-b px-4 py-2.5">
        <span className="text-xs uppercase font-bold text-primary">Civil ID</span>
        <span className="text-xs font-bold">{badges.length ? badges.join(" · ") : "On file"}</span>
      </CardHeader>
      <CardContent className="grid gap-3 p-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="min-w-0 flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">ID Number</span>
            <strong className="text-sm font-semibold break-words">{candidate.candidate_civil_id || "—"}</strong>
          </div>
          <div className="min-w-0 flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Expiry date</span>
            <strong className={`text-sm font-semibold ${isExpired ? "text-destructive" : isNearExpiry ? "text-amber-600" : ""}`}>
              {expiryDate ? formatDate(expiryDate) : "—"}
            </strong>
          </div>
        </div>
        {candidate.candidate_civil_photo_front || candidate.candidate_civil_photo_back ? (
          <div className="grid grid-cols-2 gap-2 max-sm:grid-cols-1">
            {candidate.candidate_civil_photo_front ? (
              <div className="min-w-0 flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">Photo (front)</span>
                <img src={candidate.candidate_civil_photo_front} alt="Civil ID front" loading="lazy" className="max-w-full h-auto border rounded aspect-[16/10] object-cover" />
              </div>
            ) : null}
            {candidate.candidate_civil_photo_back ? (
              <div className="min-w-0 flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">Photo (back)</span>
                <img src={candidate.candidate_civil_photo_back} alt="Civil ID back" loading="lazy" className="max-w-full h-auto border rounded aspect-[16/10] object-cover" />
              </div>
            ) : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
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
    <Card className="min-w-0">
      <CardHeader className="flex flex-row items-center justify-between border-b px-3 py-2.5">
        <span className="text-xs uppercase font-bold text-primary">{title}</span>
        <span className="text-xs font-bold">{rows.length.toLocaleString("en-US")}</span>
      </CardHeader>
      <CardContent className="grid gap-2 p-3">
        {rows.slice(0, limit).map((row) =>
          row.href ? (
            row.href.startsWith("/") ? (
              <Link
                href={row.href as Route}
                key={`${title}-${row.id}`}
                className="min-w-0 grid gap-1 border rounded-lg bg-muted/30 p-2.5 hover:border-primary hover:bg-primary/5 transition-colors no-underline"
              >
                <RowContent row={row} />
              </Link>
            ) : (
              <a
                href={row.href}
                key={`${title}-${row.id}`}
                className="min-w-0 grid gap-1 border rounded-lg bg-muted/30 p-2.5 hover:border-primary hover:bg-primary/5 transition-colors no-underline"
              >
                <RowContent row={row} />
              </a>
            )
          ) : (
            <article
              key={`${title}-${row.id}`}
              className="min-w-0 grid gap-1 border rounded-lg bg-muted/30 p-2.5"
            >
              <RowContent row={row} />
            </article>
          )
        )}
        {!rows.length ? <small className="text-xs text-muted-foreground">No imported rows visible for this login.</small> : null}
      </CardContent>
    </Card>
  );
}

function RowContent({ row }: { row: { title: string; subtitle: string; meta?: string } }) {
  return (
    <>
      <strong className="truncate text-sm">{row.title}</strong>
      <span className="truncate text-xs text-muted-foreground">{row.subtitle}</span>
      {row.meta ? <small className="truncate text-xs text-muted-foreground">{row.meta}</small> : null}
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
    <Card className="min-w-0">
      <CardHeader className="flex flex-row items-center justify-between border-b px-3 py-2.5">
        <span className="text-xs uppercase font-bold text-primary">Work logs</span>
        <span className="text-xs font-bold">{hours.length.toLocaleString("en-US")}</span>
      </CardHeader>
      <CardContent className="grid gap-2 p-3">
        {hours.slice(0, 8).map((hour) => (
          <article
            key={`worklog-${hour.id}`}
            className="min-w-0 grid gap-1 border rounded-lg bg-muted/30 p-2.5"
          >
            <RowContent row={hour} />
            <WorkLogStaffActions workLogUuid={String(hour.id)} currentStatus={hour.status} />
          </article>
        ))}
        {!hours.length ? <small className="text-xs text-muted-foreground">No work log records for this candidate.</small> : null}
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
