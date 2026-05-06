import type { Route } from "next";
import Link from "next/link";
import type { getCandidateDetail } from "@/modules/workspace/data";
import { formatDate } from "@/modules/workspace/format";

type CandidateDetailData = Awaited<ReturnType<typeof getCandidateDetail>>;

type CandidateAction = {
  label: string;
  href: string;
};

export function CandidateProfile({
  detail,
  actions,
  backHref,
  compact = false
}: {
  detail: CandidateDetailData | null;
  actions: CandidateAction[];
  backHref?: Route;
  compact?: boolean;
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
        {actions.map((action) =>
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

      <section className="candidateReadiness" aria-label="Candidate readiness">
        <div className="candidateReadinessScore">
          <span>Readiness</span>
          <strong>{readiness.score}%</strong>
          <small>{readiness.summary}</small>
        </div>
        <div className="candidateReadinessItems">
          {readiness.items.map((item) => (
            <div className={item.done ? "done" : "open"} key={item.label}>
              <span>{item.done ? "Done" : "Open"}</span>
              <strong>{item.label}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="candidateFactGrid" aria-label="Candidate facts">
        <Fact label="Email" value={candidate.candidate_email} />
        <Fact label="Phone" value={candidate.candidate_phone ?? "No phone"} />
        <Fact label="Country" value={candidate.country?.country_name_en ?? "Not set"} />
        <Fact label="University" value={candidate.university?.university_name_en ?? "Not set"} />
        <Fact label="Company" value={candidate.store?.company?.company_name ?? "Not assigned"} />
        <Fact label="Store" value={candidate.store?.store_name ?? "Not assigned"} />
        <Fact label="Rate" value={detail.metrics[1]?.value ?? "0"} />
        <Fact label="Revenue" value={detail.stats?.totalRevenue ?? "No revenue stats"} />
        <Fact label="Civil ID" value={candidate.candidate_civil_expiry_date ? `Expires ${formatDate(candidate.candidate_civil_expiry_date)}` : "Not set"} />
        <Fact label="Updated" value={formatDate(candidate.candidate_updated_at)} />
      </section>

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
          <RowsPanel title="Invitations" rows={detail.invitations} />
          <RowsPanel title="Work history" rows={detail.histories} />
          <RowsPanel title="Work logs" rows={detail.workHours} />
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
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function PanelHeader({ title, count }: { title: string; count: number }) {
  return (
    <div className="candidatePanelHeader">
      <span>{title}</span>
      <strong>{count.toLocaleString("en-US")}</strong>
    </div>
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
    <section className="candidateProfilePanel">
      <PanelHeader title={title} count={rows.length} />
      <div className="candidateRows">
        {rows.slice(0, limit).map((row) =>
          row.href ? (
            row.href.startsWith("/") ? (
              <Link href={row.href as Route} key={`${title}-${row.id}`}>
                <RowContent row={row} />
              </Link>
            ) : (
              <a href={row.href} key={`${title}-${row.id}`}>
                <RowContent row={row} />
              </a>
            )
          ) : (
            <article key={`${title}-${row.id}`}>
              <RowContent row={row} />
            </article>
          )
        )}
        {!rows.length ? <small>No imported rows visible for this login.</small> : null}
      </div>
    </section>
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

function buildReadiness(detail: CandidateDetailData) {
  const candidate = detail.candidate;
  const items = [
    { label: "Approved", done: Boolean(candidate && candidate.approved !== 0) },
    { label: "Active status", done: candidate?.candidate_status === 10 },
    { label: "Profile complete", done: Boolean(candidate && !candidate.is_incomplete_profile) },
    { label: "Civil ID clear", done: Boolean(candidate && !candidate.candidate_civil_need_verification) },
    { label: "Contact verified", done: Boolean(candidate?.candidate_email_verification || candidate?.candidate_phone) },
    { label: "Skills imported", done: detail.skills.length > 0 },
    { label: "Work context", done: detail.histories.length > 0 || detail.invitations.length > 0 },
    { label: "Document trail", done: detail.idCards.length > 0 || detail.links.length > 0 || Boolean(candidate?.candidate_resume) }
  ];
  const done = items.filter((item) => item.done).length;
  const score = Math.round((done / items.length) * 100);
  const summary = score >= 85 ? "Ready to present" : score >= 60 ? "Usable with cleanup" : "Needs staff attention";
  return { items, score, summary };
}

function buildTimeline(detail: CandidateDetailData) {
  return [
    ...detail.invitations.map((row) => ({ ...row, title: `Invitation · ${row.title}` })),
    ...detail.histories.map((row) => ({ ...row, title: `Assignment · ${row.title}` })),
    ...detail.workHours.map((row) => ({ ...row, title: `Work log · ${row.title}` })),
    ...detail.notes.map((row) => ({ ...row, title: `Note · ${row.title}` }))
  ].slice(0, 16);
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}
