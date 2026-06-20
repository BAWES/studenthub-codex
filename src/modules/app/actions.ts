// ---------------------------------------------------------------------------
// Hub workspace — module-level server actions
// ---------------------------------------------------------------------------

import "server-only";

import type { Route } from "next";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/modules/auth/session";
import type { SessionUser } from "@/modules/auth/types";
import { formatDate, formatMoney } from "@/modules/workspace/format";
import type { HubResult, HubScope } from "./types";
import type { HubInput } from "./schemas";
import { getHubInputSchema } from "./schemas";

import {
  ratio,
  shouldQuery,
  scopesForRole,
  hubResultFromRecord,
  compactText,
} from "./helpers";

import {
  candidateHref,
  candidateListHref,
  companyHref,
  requestHref,
  requestListHref,
  workspaceNavigation,
  accessSummary,
} from "./navigation";

import {
  searchCandidates,
  searchCompanies,
  searchRequests,
  searchTransfers,
  searchIdRequests,
  companyIdsForContact,
  candidateIdsForStaff,
} from "./queries";

import { buildPreview } from "./previews";

// ---------------------------------------------------------------------------
// Server action — get unified hub data
// ---------------------------------------------------------------------------

/**
 * Fetch unified hub data for the current session.
 * Mirrors the legacy getUnifiedHub() from @/modules/hub/data.
 */
export async function getUnifiedHubAction(options: HubInput) {
  const session = await requireSession();

  const parsed = getHubInputSchema.safeParse(options);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid hub input");
  }

  return getUnifiedHub(session, {
    query: parsed.data.query,
    scope: parsed.data.scope as HubScope,
    record: parsed.data.record,
  });
}

// ---------------------------------------------------------------------------
// Main hub logic
// ---------------------------------------------------------------------------

async function getUnifiedHub(
  session: SessionUser,
  options: { query?: string; scope?: HubScope; record?: string },
) {
  const query = options.query?.trim() ?? "";
  const availableScopes = scopesForRole(session.role);
  const requestedScope = options.scope ?? "all";
  const scope = availableScopes.some((item) => item.value === requestedScope)
    ? requestedScope
    : "all";
  const companyIds =
    session.role === "company" ? await companyIdsForContact(session.id) : [];
  const staffCandidateIds =
    session.role === "staff"
      ? await candidateIdsForStaff(Number(session.id))
      : [];

  const [
    needsReview,
    incomplete,
    activeCandidates,
    assignedRequests,
    allRequests,
    companyApprovals,
    pendingIdRequests,
    activeTransfers,
  ] = await prisma.$transaction([
    prisma.candidate.count({ where: { deleted: 0, approved: 0 } }),
    prisma.candidate.count({
      where: { deleted: 0, is_incomplete_profile: true },
    }),
    prisma.candidate.count({
      where: { deleted: 0, candidate_status: 10, approved: { not: 0 } },
    }),
    prisma.request.count({
      where:
        session.role === "staff" ? { staff_id: Number(session.id) } : {},
    }),
    prisma.request.count(),
    prisma.company.count({
      where: { deleted: 0, company_approved_to_hire: false },
    }),
    prisma.candidate_id_request.count({ where: { status: "pending" } }),
    prisma.transfer.count({ where: { deleted: 0 } }),
  ]);

  const [candidateResults, companyResults, requestResults, transferResults, idRequestResults] =
    await Promise.all([
      shouldQuery(scope, ["all", "people"])
        ? searchCandidates(session, query, staffCandidateIds)
        : [],
      shouldQuery(scope, ["all", "companies"])
        ? searchCompanies(session, query, companyIds)
        : [],
      shouldQuery(scope, ["all", "demand"])
        ? searchRequests(session, query, companyIds)
        : [],
      shouldQuery(scope, ["all", "money"])
        ? searchTransfers(session, query)
        : [],
      shouldQuery(scope, ["all", "compliance"])
        ? searchIdRequests(session, query)
        : [],
    ]);

  const results = [
    ...candidateResults.map((candidate) => ({
      id: `candidate-${candidate.candidate_id}`,
      type: "Candidate",
      title: candidate.candidate_name,
      subtitle: candidate.candidate_email,
      meta: `${candidate.approved === 0 ? "Needs review" : candidate.candidate_status === 10 ? "Active" : `Status ${candidate.candidate_status}`} · ${candidate.country?.country_name_en ?? "No country"} · ${formatDate(candidate.candidate_updated_at)}`,
      href: candidateHref(session, candidate.candidate_id),
    })),
    ...companyResults.map((company) => ({
      id: `company-${company.company_id}`,
      type: "Company",
      title: company.company_name,
      subtitle: company.company_email ?? "No email",
      meta: `${company.company_approved_to_hire ? "Approved" : "Needs approval"} · ${company.no_of_active_requests ?? 0} active requests · ${formatMoney(company.company_hourly_rate, company.currency_code ?? "KWD")}`,
      href: companyHref(session, company.company_id),
    })),
    ...requestResults.map((request) => ({
      id: `request-${request.request_uuid}`,
      type: "Request",
      title: request.request_position_title ?? "Untitled request",
      subtitle: request.company?.company_name ?? "No company",
      meta: `${request.request_status ?? "No status"} · ${request.request_number_of_employees ?? 0} seats · ${formatDate(request.request_updated_datetime)}`,
      href: requestHref(session, request.request_uuid),
    })),
    ...transferResults.map((transfer) => ({
      id: `transfer-${transfer.transfer_id}`,
      type: "Transfer",
      title:
        transfer.company?.company_name ?? `Transfer #${transfer.transfer_id}`,
      subtitle: `${formatDate(transfer.start_date)} to ${formatDate(transfer.end_date)}`,
      meta: `Status ${transfer.transfer_status} · ${formatMoney(transfer.total ?? transfer.company_total, transfer.currency_code ?? "KWD")}`,
      href:
        session.role === "admin"
          ? (`/admin/transfers/${transfer.transfer_id}` as Route)
          : undefined,
    })),
    ...idRequestResults.map((request) => ({
      id: `id-${request.cir_uuid}`,
      type: "ID Request",
      title: `ID batch ${request.cir_uuid.slice(0, 12)}`,
      subtitle: request.candidate_ids
        ? `${parseCandidateIds(request.candidate_ids).length} candidates`
        : "No candidates",
      meta: `${request.status ?? "pending"} · ${formatDate(request.created_at)}`,
      href:
        session.role === "inspector"
          ? (`/inspector/id-requests/${request.cir_uuid}` as Route)
          : undefined,
    })),
  ] satisfies HubResult[];

  const selectedResult = options.record
    ? results.find((result) => result.id === options.record) ??
      hubResultFromRecord(options.record)
    : results[0];
  const preview = selectedResult
    ? await buildPreview(session, selectedResult)
    : null;

  return {
    query,
    scope,
    scopes: availableScopes,
    hero: {
      title: "StudentHub Command",
      subtitle:
        "Your authorized workspace for the records and workflows connected to this login.",
    },
    queues: [
      {
        label: "Needs review",
        value: needsReview,
        note: "Candidate approvals waiting",
        href: candidateListHref(session, "needs-review"),
        tone: "attention",
      },
      {
        label: "Incomplete",
        value: incomplete,
        note: "Profiles blocking placement",
        href: candidateListHref(session, "incomplete"),
        tone: "warning",
      },
      {
        label: session.role === "staff" ? "My requests" : "Requests",
        value: session.role === "staff" ? assignedRequests : allRequests,
        note: "Hiring demand across the pipeline",
        href: requestListHref(session),
        tone: "demand",
      },
      {
        label: "ID review",
        value: pendingIdRequests,
        note: "Civil ID batches pending",
        href:
          session.role === "inspector" ? "/inspector/id-requests" : undefined,
        tone: "compliance",
      },
    ],
    system: [
      {
        label: "Active candidates",
        value: activeCandidates,
        note: "Approved and available",
      },
      {
        label: "Company approvals",
        value: companyApprovals,
        note: "Employers not yet cleared",
      },
      {
        label: "Transfers",
        value: activeTransfers,
        note: "Payroll and invoice records",
      },
    ],
    workstreams: [
      {
        label: "Candidate Readiness",
        value: needsReview + incomplete,
        meta: `${needsReview.toLocaleString("en-US")} review · ${incomplete.toLocaleString("en-US")} incomplete`,
        progress: ratio(
          activeCandidates,
          activeCandidates + needsReview + incomplete,
        ),
        href: candidateListHref(session, "needs-review"),
        tone: "attention",
      },
      {
        label: "Hiring Demand",
        value:
          session.role === "staff" ? assignedRequests : allRequests,
        meta:
          session.role === "staff"
            ? "Assigned to this staff account"
            : "Requests across the database",
        progress: ratio(
          session.role === "staff" ? assignedRequests : allRequests,
          allRequests,
        ),
        href: requestListHref(session),
        tone: "demand",
      },
      {
        label: "Employer Access",
        value: companyApprovals,
        meta: "Companies not cleared to hire",
        progress: ratio(
          Math.max(0, activeCandidates - companyApprovals),
          activeCandidates,
        ),
        href:
          session.role === "admin"
            ? ("/admin/companies" as Route)
            : session.role === "company"
              ? ("/company/companies" as Route)
              : undefined,
        tone: "warning",
      },
      {
        label: "Compliance",
        value: pendingIdRequests,
        meta: "ID batches waiting",
        progress: pendingIdRequests ? 12 : 100,
        href:
          session.role === "inspector"
            ? ("/inspector/id-requests" as Route)
            : undefined,
        tone: "compliance",
      },
      {
        label: "Payroll",
        value: activeTransfers,
        meta: "Transfer records imported",
        progress: 68,
        href:
          session.role === "admin"
            ? ("/admin/transfers" as Route)
            : undefined,
        tone: "money",
      },
    ],
    navigation: workspaceNavigation(session.role),
    access: accessSummary(session.role),
    results,
    preview,
  };
}

function parseCandidateIds(value: string | null | undefined) {
  if (!value) return [];
  return value
    .split(/[^0-9]+/)
    .map((item) => Number(item))
    .filter((item) => Number.isInteger(item) && item > 0);
}
