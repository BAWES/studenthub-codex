import type { Prisma } from "@prisma/client";
import type { Route } from "next";
import { prisma } from "@/lib/prisma";
import type { Role, SessionUser } from "@/modules/auth/types";
import { formatDate, formatMoney } from "@/modules/workspace/format";

export type HubScope = "all" | "people" | "demand" | "companies" | "money" | "compliance";

type HubResult = {
  id: string;
  type: string;
  title: string;
  subtitle: string;
  meta: string;
  href?: Route;
};

type HubPreview = {
  id: string;
  type: string;
  title: string;
  subtitle: string;
  meta: string;
  href?: Route;
  actions: { label: string; href: string }[];
  flags: string[];
  facts: { label: string; value: string | number }[];
  related: {
    title: string;
    rows: { id: string | number; title: string; subtitle: string; meta: string; href?: Route }[];
  }[];
};

type HubNavigationItem = {
  label: string;
  description: string;
  href: Route;
};

const scopeLabels: Record<HubScope, string> = {
  all: "All",
  people: "People",
  demand: "Demand",
  companies: "Companies",
  money: "Money",
  compliance: "Compliance"
};

export const hubScopes = Object.entries(scopeLabels).map(([value, label]) => ({
  value: value as HubScope,
  label
}));

export function parseHubScope(value: string | string[] | undefined): HubScope {
  const scope = Array.isArray(value) ? value[0] : value;
  return scope && scope in scopeLabels ? (scope as HubScope) : "all";
}

export async function getUnifiedHub(session: SessionUser, options: { query?: string; scope?: HubScope; record?: string }) {
  const query = options.query?.trim() ?? "";
  const availableScopes = scopesForRole(session.role);
  const requestedScope = options.scope ?? "all";
  const scope = availableScopes.some((item) => item.value === requestedScope) ? requestedScope : "all";
  const companyIds = session.role === "company" ? await companyIdsForContact(session.id) : [];
  const staffCandidateIds = session.role === "staff" ? await candidateIdsForStaff(Number(session.id)) : [];

  const [
    needsReview,
    incomplete,
    activeCandidates,
    assignedRequests,
    allRequests,
    companyApprovals,
    pendingIdRequests,
    activeTransfers
  ] = await prisma.$transaction([
    prisma.candidate.count({ where: { deleted: 0, approved: 0 } }),
    prisma.candidate.count({ where: { deleted: 0, is_incomplete_profile: true } }),
    prisma.candidate.count({ where: { deleted: 0, candidate_status: 10, approved: { not: 0 } } }),
    prisma.request.count({ where: session.role === "staff" ? { staff_id: Number(session.id) } : {} }),
    prisma.request.count(),
    prisma.company.count({ where: { deleted: 0, company_approved_to_hire: false } }),
    prisma.candidate_id_request.count({ where: { status: "pending" } }),
    prisma.transfer.count({ where: { deleted: 0 } })
  ]);

  const [candidateResults, companyResults, requestResults, transferResults, idRequestResults] = await Promise.all([
    shouldQuery(scope, ["all", "people"]) ? searchCandidates(session, query, staffCandidateIds) : [],
    shouldQuery(scope, ["all", "companies"]) ? searchCompanies(session, query, companyIds) : [],
    shouldQuery(scope, ["all", "demand"]) ? searchRequests(session, query, companyIds) : [],
    shouldQuery(scope, ["all", "money"]) ? searchTransfers(session, query) : [],
    shouldQuery(scope, ["all", "compliance"]) ? searchIdRequests(session, query) : []
  ]);

  const results = [
    ...candidateResults.map((candidate) => ({
      id: `candidate-${candidate.candidate_id}`,
      type: "Candidate",
      title: candidate.candidate_name,
      subtitle: candidate.candidate_email,
      meta: `${candidate.approved === 0 ? "Needs review" : candidate.candidate_status === 10 ? "Active" : `Status ${candidate.candidate_status}`} · ${candidate.country?.country_name_en ?? "No country"} · ${formatDate(candidate.candidate_updated_at)}`,
      href: candidateHref(session, candidate.candidate_id)
    })),
    ...companyResults.map((company) => ({
      id: `company-${company.company_id}`,
      type: "Company",
      title: company.company_name,
      subtitle: company.company_email ?? "No email",
      meta: `${company.company_approved_to_hire ? "Approved" : "Needs approval"} · ${company.no_of_active_requests ?? 0} active requests · ${formatMoney(company.company_hourly_rate, company.currency_code ?? "KWD")}`,
      href: companyHref(session, company.company_id)
    })),
    ...requestResults.map((request) => ({
      id: `request-${request.request_uuid}`,
      type: "Request",
      title: request.request_position_title ?? "Untitled request",
      subtitle: request.company?.company_name ?? "No company",
      meta: `${request.request_status ?? "No status"} · ${request.request_number_of_employees ?? 0} seats · ${formatDate(request.request_updated_datetime)}`,
      href: requestHref(session, request.request_uuid)
    })),
    ...transferResults.map((transfer) => ({
      id: `transfer-${transfer.transfer_id}`,
      type: "Transfer",
      title: transfer.company?.company_name ?? `Transfer #${transfer.transfer_id}`,
      subtitle: `${formatDate(transfer.start_date)} to ${formatDate(transfer.end_date)}`,
      meta: `Status ${transfer.transfer_status} · ${formatMoney(transfer.total ?? transfer.company_total, transfer.currency_code ?? "KWD")}`,
      href: session.role === "admin" ? (`/admin/transfers/${transfer.transfer_id}` as Route) : undefined
    })),
    ...idRequestResults.map((request) => ({
      id: `id-${request.cir_uuid}`,
      type: "ID Request",
      title: `ID batch ${request.cir_uuid.slice(0, 12)}`,
      subtitle: request.candidate_ids ? `${parseCandidateIds(request.candidate_ids).length} candidates` : "No candidates",
      meta: `${request.status ?? "pending"} · ${formatDate(request.created_at)}`,
      href: session.role === "inspector" ? (`/inspector/id-requests/${request.cir_uuid}` as Route) : undefined
    }))
  ] satisfies HubResult[];
  const selectedResult = options.record
    ? results.find((result) => result.id === options.record) ?? hubResultFromRecord(options.record)
    : results[0];
  const preview = selectedResult ? await buildPreview(session, selectedResult) : null;

  return {
    query,
    scope,
    scopes: availableScopes,
    hero: {
      title: "StudentHub Command",
      subtitle: "Your authorized workspace for the records and workflows connected to this login."
    },
    queues: [
      {
        label: "Needs review",
        value: needsReview,
        note: "Candidate approvals waiting",
        href: candidateListHref(session, "needs-review"),
        tone: "attention"
      },
      {
        label: "Incomplete",
        value: incomplete,
        note: "Profiles blocking placement",
        href: candidateListHref(session, "incomplete"),
        tone: "warning"
      },
      {
        label: session.role === "staff" ? "My requests" : "Requests",
        value: session.role === "staff" ? assignedRequests : allRequests,
        note: "Hiring demand across the pipeline",
        href: requestListHref(session),
        tone: "demand"
      },
      {
        label: "ID review",
        value: pendingIdRequests,
        note: "Civil ID batches pending",
        href: session.role === "inspector" ? "/inspector/id-requests" : undefined,
        tone: "compliance"
      }
    ],
    system: [
      { label: "Active candidates", value: activeCandidates, note: "Approved and available" },
      { label: "Company approvals", value: companyApprovals, note: "Employers not yet cleared" },
      { label: "Transfers", value: activeTransfers, note: "Payroll and invoice records" }
    ],
    workstreams: [
      {
        label: "Candidate Readiness",
        value: needsReview + incomplete,
        meta: `${needsReview.toLocaleString("en-US")} review · ${incomplete.toLocaleString("en-US")} incomplete`,
        progress: ratio(activeCandidates, activeCandidates + needsReview + incomplete),
        href: candidateListHref(session, "needs-review"),
        tone: "attention"
      },
      {
        label: "Hiring Demand",
        value: session.role === "staff" ? assignedRequests : allRequests,
        meta: session.role === "staff" ? "Assigned to this staff account" : "Requests across the database",
        progress: ratio(session.role === "staff" ? assignedRequests : allRequests, allRequests),
        href: requestListHref(session),
        tone: "demand"
      },
      {
        label: "Employer Access",
        value: companyApprovals,
        meta: "Companies not cleared to hire",
        progress: ratio(Math.max(0, activeCandidates - companyApprovals), activeCandidates),
        href: session.role === "admin" ? ("/admin/companies" as Route) : session.role === "company" ? ("/company/companies" as Route) : undefined,
        tone: "warning"
      },
      {
        label: "Compliance",
        value: pendingIdRequests,
        meta: "ID batches waiting",
        progress: pendingIdRequests ? 12 : 100,
        href: session.role === "inspector" ? ("/inspector/id-requests" as Route) : undefined,
        tone: "compliance"
      },
      {
        label: "Payroll",
        value: activeTransfers,
        meta: "Transfer records imported",
        progress: 68,
        href: session.role === "admin" ? ("/admin/transfers" as Route) : undefined,
        tone: "money"
      }
    ],
    navigation: workspaceNavigation(session.role),
    access: accessSummary(session.role),
    results,
    preview
  };
}

function ratio(value: number, total: number) {
  if (!total) return 0;
  return Math.max(0, Math.min(100, Math.round((value / total) * 100)));
}

function shouldQuery(scope: HubScope, scopes: HubScope[]) {
  return scopes.includes(scope);
}

function scopesForRole(role: Role) {
  const values: Record<Role, HubScope[]> = {
    admin: ["all", "people", "demand", "companies", "money", "compliance"],
    staff: ["all", "people", "demand"],
    candidate: ["all", "people"],
    company: ["all", "demand", "companies"],
    inspector: ["all", "compliance"]
  };
  return hubScopes.filter((scope) => values[role].includes(scope.value));
}

function hubResultFromRecord(record: string): HubResult | null {
  if (record.startsWith("candidate-")) {
    return { id: record, type: "Candidate", title: "Candidate record", subtitle: "Loading candidate", meta: "Selected record" };
  }
  if (record.startsWith("company-")) {
    return { id: record, type: "Company", title: "Company record", subtitle: "Loading company", meta: "Selected record" };
  }
  if (record.startsWith("request-")) {
    return { id: record, type: "Request", title: "Request record", subtitle: "Loading request", meta: "Selected record" };
  }
  if (record.startsWith("transfer-")) {
    return { id: record, type: "Transfer", title: "Transfer record", subtitle: "Loading transfer", meta: "Selected record" };
  }
  if (record.startsWith("id-")) {
    return { id: record, type: "ID Request", title: "ID request record", subtitle: "Loading ID batch", meta: "Selected record" };
  }
  return null;
}

async function searchCandidates(session: SessionUser, query: string, staffCandidateIds: number[]) {
  if (!["admin", "staff", "candidate"].includes(session.role)) return [];
  if (session.role === "staff" && !staffCandidateIds.length) return [];

  const numeric = Number(query);
  const where: Prisma.candidateWhereInput = {
    deleted: 0,
    ...(session.role === "candidate" ? { candidate_id: Number(session.id) } : {}),
    ...(session.role === "staff" ? { candidate_id: { in: staffCandidateIds } } : {})
  };

  if (query) {
    where.OR = [
      { candidate_name: { contains: query } },
      { candidate_email: { contains: query } },
      ...(Number.isInteger(numeric) ? [{ candidate_id: numeric }] : [])
    ];
  }

  return prisma.candidate.findMany({
    where,
    orderBy: { candidate_updated_at: "desc" },
    take: query ? 8 : 5,
    select: {
      candidate_id: true,
      candidate_name: true,
      candidate_email: true,
      candidate_status: true,
      approved: true,
      candidate_updated_at: true,
      country: { select: { country_name_en: true } }
    }
  });
}

async function buildPreview(session: SessionUser, result: HubResult): Promise<HubPreview> {
  if (result.id.startsWith("candidate-")) {
    const candidateId = Number(result.id.replace("candidate-", ""));
    const candidate = await getCandidatePreview(session, candidateId);
    return candidate ?? unavailablePreview(result);
  }

  if (result.id.startsWith("company-")) {
    const companyId = Number(result.id.replace("company-", ""));
    const company = await getCompanyPreview(session, companyId);
    return company ?? unavailablePreview(result);
  }

  if (result.id.startsWith("request-")) {
    const requestUuid = result.id.slice("request-".length);
    const request = await getRequestPreview(session, requestUuid);
    return request ?? unavailablePreview(result);
  }

  if (result.id.startsWith("transfer-")) {
    const transferId = Number(result.id.replace("transfer-", ""));
    const transfer = await getTransferPreview(session, transferId);
    return transfer ?? unavailablePreview(result);
  }

  if (result.id.startsWith("id-")) {
    const idRequestUuid = result.id.slice("id-".length);
    const idRequest = await getIdRequestPreview(session, idRequestUuid);
    return idRequest ?? unavailablePreview(result);
  }

  return {
    id: result.id,
    type: result.type,
    title: result.title,
    subtitle: result.subtitle,
    meta: result.meta,
    href: result.href,
    actions: result.href ? [{ label: "Open full record", href: result.href }] : [],
    flags: [result.type],
    facts: [{ label: "Status", value: result.meta }],
    related: []
  };
}

function unavailablePreview(result: HubResult): HubPreview {
  return {
    id: result.id,
    type: result.type,
    title: `${result.type} unavailable`,
    subtitle: "Missing, deleted, or not available to this role.",
    meta: result.meta,
    href: undefined,
    actions: [],
    flags: ["Not accessible", result.type],
    facts: [
      { label: "Record", value: result.id },
      { label: "Access", value: "Current role cannot open this record" }
    ],
    related: []
  };
}

function compactText(value: string | null | undefined, max = 120) {
  const normalized = value?.replace(/\s+/g, " ").trim();
  if (!normalized) return "No detail";
  return normalized.length > max ? `${normalized.slice(0, max - 1)}...` : normalized;
}

async function getCandidatePreview(session: SessionUser, candidateId: number): Promise<HubPreview | null> {
  if (session.role === "candidate" && Number(session.id) !== candidateId) return null;
  if (!["admin", "staff", "candidate"].includes(session.role)) return null;
  if (session.role === "staff" && !(await canStaffAccessCandidate(Number(session.id), candidateId))) return null;

  const [candidate, notes, invitations, histories] = await prisma.$transaction([
    prisma.candidate.findFirst({
      where: { candidate_id: candidateId, deleted: 0 },
      select: {
        candidate_id: true,
        candidate_uid: true,
        candidate_name: true,
        candidate_name_ar: true,
        candidate_email: true,
        candidate_phone: true,
        candidate_status: true,
        approved: true,
        candidate_hourly_rate: true,
        currency_code: true,
        candidate_civil_need_verification: true,
        is_incomplete_profile: true,
        candidate_updated_at: true,
        country: { select: { country_name_en: true } },
        university: { select: { university_name_en: true } },
        store: { select: { store_name: true, company: { select: { company_name: true } } } }
      }
    }),
    prisma.note.findMany({
      where: { candidate_id: candidateId },
      orderBy: { note_created_datetime: "desc" },
      take: 3,
      select: { note_uuid: true, note_type: true, note_text: true, note_created_datetime: true }
    }),
    prisma.invitation.findMany({
      where: { candidate_id: candidateId },
      orderBy: { invitation_created_at: "desc" },
      take: 3,
      select: {
        invitation_uuid: true,
        invitation_status: true,
        invitation_created_at: true,
        request: { select: { request_uuid: true, request_position_title: true, company: { select: { company_name: true } } } }
      }
    }),
    prisma.candidate_work_history.findMany({
      where: { candidate_id: candidateId },
      orderBy: { end_date: "desc" },
      take: 3,
      select: {
        id: true,
        start_date: true,
        end_date: true,
        company_candidate_work_history_company_idTocompany: { select: { company_name: true } },
        staff: { select: { staff_name: true } }
      }
    })
  ]);

  if (!candidate) return null;

  const status = candidate.approved === 0 ? "Needs review" : candidate.candidate_status === 10 ? "Active" : `Status ${candidate.candidate_status}`;
  const href = candidateHref(session, candidate.candidate_id);
  const actions = [
    href ? { label: "Open full record", href } : null,
    candidate.candidate_email ? { label: "Email", href: `mailto:${candidate.candidate_email}` } : null,
    candidate.candidate_phone ? { label: "Call", href: `tel:${candidate.candidate_phone}` } : null
  ].filter((action): action is { label: string; href: string } => Boolean(action));

  return {
    id: `candidate-${candidate.candidate_id}`,
    type: "Candidate",
    title: candidate.candidate_name,
    subtitle: candidate.candidate_email,
    meta: `${status} · ${candidate.country?.country_name_en ?? "No country"} · ${formatDate(candidate.candidate_updated_at)}`,
    href,
    actions,
    flags: [
      status,
      candidate.is_incomplete_profile ? "Incomplete" : "Profile complete",
      candidate.candidate_civil_need_verification ? "Civil ID review" : "Civil ID clear"
    ],
    facts: [
      { label: "Candidate ID", value: candidate.candidate_id },
      { label: "UID", value: candidate.candidate_uid ?? "Not set" },
      { label: "Rate", value: formatMoney(candidate.candidate_hourly_rate, candidate.currency_code ?? "KWD") },
      { label: "Phone", value: candidate.candidate_phone ?? "No phone" },
      { label: "University", value: candidate.university?.university_name_en ?? "Not set" },
      { label: "Assignment", value: candidate.store?.company?.company_name ?? candidate.store?.store_name ?? "No assignment" }
    ],
    related: [
      {
        title: "Recent notes",
        rows: notes.map((note) => ({
          id: note.note_uuid,
          title: note.note_type ?? "Note",
          subtitle: note.note_text?.slice(0, 120) ?? "Empty note",
          meta: formatDate(note.note_created_datetime)
        }))
      },
      {
        title: "Invitations",
        rows: invitations.map((invitation) => ({
          id: invitation.invitation_uuid,
          title: invitation.request.request_position_title ?? "Invitation",
          subtitle: invitation.request.company?.company_name ?? "No company",
          meta: `Status ${invitation.invitation_status ?? 0} · ${formatDate(invitation.invitation_created_at)}`,
          href: requestHref(session, invitation.request.request_uuid)
        }))
      },
      {
        title: "Work history",
        rows: histories.map((history) => ({
          id: history.id,
          title: history.company_candidate_work_history_company_idTocompany?.company_name ?? "Assignment",
          subtitle: history.staff?.staff_name ?? "No staff owner",
          meta: `${formatDate(history.start_date)} to ${formatDate(history.end_date)}`
        }))
      }
    ]
  };
}

async function getCompanyPreview(session: SessionUser, companyId: number): Promise<HubPreview | null> {
  if (!["admin", "company"].includes(session.role)) return null;
  if (session.role === "company") {
    const companyIds = await companyIdsForContact(session.id);
    if (!companyIds.includes(companyId)) return null;
  }

  const [company, requests, contacts, stores, notes] = await prisma.$transaction([
    prisma.company.findFirst({
      where: { company_id: companyId, deleted: 0 },
      select: {
        company_id: true,
        company_name: true,
        company_common_name_en: true,
        company_email: true,
        company_website: true,
        company_approved_to_hire: true,
        company_hourly_rate: true,
        currency_code: true,
        no_of_active_requests: true,
        company_updated_at: true,
        country: { select: { country_name_en: true } },
        staff: { select: { staff_name: true, staff_email: true } }
      }
    }),
    prisma.request.findMany({
      where: { company_id: companyId },
      orderBy: { request_updated_datetime: "desc" },
      take: 4,
      select: {
        request_uuid: true,
        request_position_title: true,
        request_status: true,
        request_number_of_employees: true,
        request_updated_datetime: true
      }
    }),
    prisma.company_contact.findMany({
      where: { company_id: companyId },
      orderBy: { updated_at: "desc" },
      take: 4,
      select: {
        company_contact_uuid: true,
        contact_position: true,
        allow_access: true,
        contact: { select: { contact_name: true, contact_email: true } }
      }
    }),
    prisma.store.findMany({
      where: { company_id: companyId, deleted: 0 },
      orderBy: { store_updated_at: "desc" },
      take: 4,
      select: { store_id: true, store_name: true, store_status: true }
    }),
    prisma.note.findMany({
      where: { company_id: companyId },
      orderBy: { note_created_datetime: "desc" },
      take: 3,
      select: { note_uuid: true, note_type: true, note_text: true, note_created_datetime: true }
    })
  ]);

  if (!company) return null;

  const href = companyHref(session, company.company_id);
  const actions = [
    href ? { label: "Open full record", href } : null,
    company.company_email ? { label: "Email", href: `mailto:${company.company_email}` } : null,
    company.company_website ? { label: "Website", href: company.company_website } : null
  ].filter((action): action is { label: string; href: string } => Boolean(action));

  return {
    id: `company-${company.company_id}`,
    type: "Company",
    title: company.company_name,
    subtitle: company.company_email ?? "No email",
    meta: `${company.company_approved_to_hire ? "Approved to hire" : "Needs hiring approval"} · ${company.no_of_active_requests ?? 0} active requests · ${formatDate(company.company_updated_at)}`,
    href,
    actions,
    flags: [
      company.company_approved_to_hire ? "Approved" : "Needs approval",
      `${requests.length} recent requests`,
      `${contacts.filter((contact) => contact.allow_access).length} active contacts`
    ],
    facts: [
      { label: "Company ID", value: company.company_id },
      { label: "Common name", value: company.company_common_name_en ?? "Not set" },
      { label: "Owner", value: company.staff?.staff_name ?? "Unassigned" },
      { label: "Rate", value: formatMoney(company.company_hourly_rate, company.currency_code ?? "KWD") },
      { label: "Country", value: company.country?.country_name_en ?? "No country" },
      { label: "Updated", value: formatDate(company.company_updated_at) }
    ],
    related: [
      {
        title: "Requests",
        rows: requests.map((request) => ({
          id: request.request_uuid,
          title: request.request_position_title ?? "Untitled request",
          subtitle: `${request.request_number_of_employees ?? 0} seats`,
          meta: `${request.request_status ?? "No status"} · ${formatDate(request.request_updated_datetime)}`,
          href: requestHref(session, request.request_uuid)
        }))
      },
      {
        title: "Contacts",
        rows: contacts.map((contact) => ({
          id: contact.company_contact_uuid,
          title: contact.contact?.contact_name ?? "Contact",
          subtitle: contact.contact?.contact_email ?? "No email",
          meta: `${contact.contact_position ?? "No position"} · ${contact.allow_access ? "Access allowed" : "Access disabled"}`
        }))
      },
      {
        title: "Stores",
        rows: stores.map((store) => ({
          id: store.store_id,
          title: store.store_name,
          subtitle: `Status ${store.store_status ?? 0}`,
          meta: "Imported store"
        }))
      },
      {
        title: "Notes",
        rows: notes.map((note) => ({
          id: note.note_uuid,
          title: note.note_type ?? "Note",
          subtitle: compactText(note.note_text),
          meta: formatDate(note.note_created_datetime)
        }))
      }
    ]
  };
}

async function getRequestPreview(session: SessionUser, requestUuid: string): Promise<HubPreview | null> {
  if (session.role === "candidate" || session.role === "inspector") return null;

  const companyIds = session.role === "company" ? await companyIdsForContact(session.id) : [];
  if (session.role === "company" && !companyIds.length) return null;

  const where: Prisma.requestWhereInput = {
    request_uuid: requestUuid,
    ...(session.role === "staff" ? { staff_id: Number(session.id) } : {}),
    ...(session.role === "company" ? { company_id: { in: companyIds } } : {})
  };

  const [request, applications, interviews, invitations, activities, notes, stories] = await prisma.$transaction([
    prisma.request.findFirst({
      where,
      select: {
        request_uuid: true,
        request_position_title: true,
        request_job_description: true,
        request_compensation: true,
        request_number_of_employees: true,
        request_location: true,
        request_status: true,
        request_priority: true,
        request_created_datetime: true,
        request_updated_datetime: true,
        request_started_at: true,
        request_finished_at: true,
        company: { select: { company_id: true, company_name: true, company_email: true } },
        contact: { select: { contact_name: true, contact_email: true } },
        staff: { select: { staff_name: true, staff_email: true } }
      }
    }),
    prisma.request_application.findMany({
      where: { request_uuid: requestUuid },
      orderBy: { created_at: "desc" },
      take: 4,
      select: {
        application_uuid: true,
        status: true,
        created_at: true,
        candidate: { select: { candidate_id: true, candidate_name: true, candidate_email: true } }
      }
    }),
    prisma.request_interview.findMany({
      where: { request_uuid: requestUuid },
      orderBy: { interview_at: "desc" },
      take: 4,
      select: {
        request_interview_uuid: true,
        interview_at: true,
        status: true,
        candidate: { select: { candidate_id: true, candidate_name: true, candidate_email: true } }
      }
    }),
    prisma.invitation.findMany({
      where: { request_uuid: requestUuid },
      orderBy: { invitation_created_at: "desc" },
      take: 4,
      select: {
        invitation_uuid: true,
        invitation_status: true,
        invitation_created_at: true,
        candidate: { select: { candidate_id: true, candidate_name: true, candidate_email: true } }
      }
    }),
    prisma.request_activity.findMany({
      where: { request_uuid: requestUuid },
      orderBy: { activity_created_datetime: "desc" },
      take: 4,
      select: {
        activity_uuid: true,
        activity_detail: true,
        activity_created_datetime: true,
        staff: { select: { staff_name: true } }
      }
    }),
    prisma.note.findMany({
      where: { request_uuid: requestUuid },
      orderBy: { note_created_datetime: "desc" },
      take: 3,
      select: { note_uuid: true, note_type: true, note_text: true, note_created_datetime: true }
    }),
    prisma.story.findMany({
      where: { request_uuid: requestUuid },
      orderBy: { story_last_updated_at: "desc" },
      take: 4,
      select: { story_uuid: true, story_status: true, story_last_updated_at: true }
    })
  ]);

  if (!request) return null;

  const href = requestHref(session, request.request_uuid);
  const companyLink = request.company?.company_id ? companyHref(session, request.company.company_id) : undefined;
  const actions = [
    href ? { label: "Open full record", href } : null,
    companyLink ? { label: "Company", href: companyLink } : null,
    request.contact?.contact_email ? { label: "Email contact", href: `mailto:${request.contact.contact_email}` } : null
  ].filter((action): action is { label: string; href: string } => Boolean(action));

  return {
    id: `request-${request.request_uuid}`,
    type: "Request",
    title: request.request_position_title ?? "Untitled request",
    subtitle: request.company?.company_name ?? "No company",
    meta: `${request.request_status ?? "No status"} · ${request.request_number_of_employees ?? 0} seats · ${formatDate(request.request_updated_datetime)}`,
    href,
    actions,
    flags: [
      request.request_status ?? "No status",
      `Priority ${request.request_priority ?? 0}`,
      `${applications.length} applications`,
      `${invitations.length} invitations`
    ],
    facts: [
      { label: "Seats", value: request.request_number_of_employees ?? 0 },
      { label: "Compensation", value: request.request_compensation || "Not set" },
      { label: "Location", value: request.request_location ?? "Not set" },
      { label: "Owner", value: request.staff?.staff_name ?? "Unassigned" },
      { label: "Contact", value: request.contact?.contact_name ?? "No contact" },
      { label: "Updated", value: formatDate(request.request_updated_datetime) }
    ],
    related: [
      {
        title: "Applications",
        rows: applications.map((application) => ({
          id: application.application_uuid,
          title: application.candidate?.candidate_name ?? "Unknown candidate",
          subtitle: application.candidate?.candidate_email ?? "No email",
          meta: `Status ${application.status ?? 0} · ${formatDate(application.created_at)}`,
          href: application.candidate?.candidate_id ? candidateHref(session, application.candidate.candidate_id) : undefined
        }))
      },
      {
        title: "Interviews",
        rows: interviews.map((interview) => ({
          id: interview.request_interview_uuid,
          title: interview.candidate?.candidate_name ?? "Interview",
          subtitle: interview.candidate?.candidate_email ?? "No email",
          meta: `Status ${interview.status ?? 0} · ${formatDate(interview.interview_at)}`,
          href: interview.candidate?.candidate_id ? candidateHref(session, interview.candidate.candidate_id) : undefined
        }))
      },
      {
        title: "Invitations",
        rows: invitations.map((invitation) => ({
          id: invitation.invitation_uuid,
          title: invitation.candidate?.candidate_name ?? "Invitation",
          subtitle: invitation.candidate?.candidate_email ?? "No email",
          meta: `Status ${invitation.invitation_status ?? 0} · ${formatDate(invitation.invitation_created_at)}`,
          href: invitation.candidate?.candidate_id ? candidateHref(session, invitation.candidate.candidate_id) : undefined
        }))
      },
      {
        title: "Activity",
        rows: activities.map((activity) => ({
          id: activity.activity_uuid,
          title: activity.staff?.staff_name ?? "Activity",
          subtitle: compactText(activity.activity_detail),
          meta: formatDate(activity.activity_created_datetime)
        }))
      },
      {
        title: "Notes",
        rows: notes.map((note) => ({
          id: note.note_uuid,
          title: note.note_type ?? "Note",
          subtitle: compactText(note.note_text),
          meta: formatDate(note.note_created_datetime)
        }))
      },
      {
        title: "Stories",
        rows: stories.map((story) => ({
          id: story.story_uuid,
          title: `Story ${story.story_uuid.slice(0, 12)}`,
          subtitle: `Status ${story.story_status}`,
          meta: formatDate(story.story_last_updated_at)
        }))
      }
    ]
  };
}

async function getTransferPreview(session: SessionUser, transferId: number): Promise<HubPreview | null> {
  if (session.role !== "admin") return null;

  const [transfer, candidates, invoices, fileEntries] = await prisma.$transaction([
    prisma.transfer.findFirst({
      where: { transfer_id: transferId, deleted: 0 },
      select: {
        transfer_id: true,
        transfer_status: true,
        total: true,
        company_total: true,
        transfer_cost: true,
        start_date: true,
        end_date: true,
        payment_received_on: true,
        transfer_updated_at: true,
        currency_code: true,
        company: { select: { company_name: true, company_email: true } },
        staff_transfer_transfer_created_byTostaff: { select: { staff_name: true } }
      }
    }),
    prisma.transfer_candidate.findMany({
      where: { transfer_id: transferId, deleted: 0 },
      orderBy: { tc_updated_at: "desc" },
      take: 5,
      select: {
        tc_id: true,
        hours: true,
        minutes: true,
        paid: true,
        candidate_total: true,
        company_total: true,
        currency_code: true,
        candidate: { select: { candidate_id: true, candidate_name: true, candidate_email: true } },
        store: { select: { store_name: true } }
      }
    }),
    prisma.invoice.findMany({
      where: { transfer_id: transferId, deleted: 0 },
      orderBy: { invoice_date: "desc" },
      take: 4,
      select: { invoice_id: true, invoice_date: true, invoice_status: true }
    }),
    prisma.transfer_file_entry.findMany({
      where: { transfer: { transfer_id: transferId } },
      take: 4,
      select: {
        tfe_uuid: true,
        status: true,
        status_description: true,
        credit_amount: true,
        credit_currency: true,
        beneficiary_name: true
      }
    })
  ]);

  if (!transfer) return null;

  const total = transfer.total ?? transfer.company_total;
  const href = `/admin/transfers/${transfer.transfer_id}` as Route;

  return {
    id: `transfer-${transfer.transfer_id}`,
    type: "Transfer",
    title: transfer.company?.company_name ?? `Transfer #${transfer.transfer_id}`,
    subtitle: `${formatDate(transfer.start_date)} to ${formatDate(transfer.end_date)}`,
    meta: `Status ${transfer.transfer_status} · ${formatMoney(total, transfer.currency_code ?? "KWD")} · ${formatDate(transfer.transfer_updated_at)}`,
    href,
    actions: [{ label: "Open full record", href }],
    flags: [
      "Payroll",
      `Status ${transfer.transfer_status}`,
      `${candidates.filter((candidate) => candidate.paid).length}/${candidates.length} paid rows`
    ],
    facts: [
      { label: "Transfer ID", value: transfer.transfer_id },
      { label: "Total", value: formatMoney(total, transfer.currency_code ?? "KWD") },
      { label: "Cost", value: formatMoney(transfer.transfer_cost, transfer.currency_code ?? "KWD") },
      { label: "Payment", value: transfer.payment_received_on ? formatDate(transfer.payment_received_on) : "Not received" },
      { label: "Created by", value: transfer.staff_transfer_transfer_created_byTostaff?.staff_name ?? "Unknown" },
      { label: "Updated", value: formatDate(transfer.transfer_updated_at) }
    ],
    related: [
      {
        title: "Candidate payouts",
        rows: candidates.map((candidate) => ({
          id: candidate.tc_id,
          title: candidate.candidate?.candidate_name ?? "Unknown candidate",
          subtitle: candidate.store?.store_name ?? candidate.candidate?.candidate_email ?? "No store",
          meta: `${candidate.hours ?? 0}h ${candidate.minutes ?? 0}m · ${candidate.paid ? "Paid" : "Unpaid"} · ${formatMoney(candidate.candidate_total ?? candidate.company_total, candidate.currency_code ?? transfer.currency_code ?? "KWD")}`,
          href: candidate.candidate?.candidate_id ? candidateHref(session, candidate.candidate.candidate_id) : undefined
        }))
      },
      {
        title: "Invoices",
        rows: invoices.map((invoice) => ({
          id: invoice.invoice_id,
          title: `Invoice #${invoice.invoice_id}`,
          subtitle: invoice.invoice_status ?? "No status",
          meta: formatDate(invoice.invoice_date)
        }))
      },
      {
        title: "Bank entries",
        rows: fileEntries.map((entry) => ({
          id: entry.tfe_uuid,
          title: entry.beneficiary_name ?? "Transfer file entry",
          subtitle: entry.status_description ?? entry.status ?? "No status",
          meta: formatMoney(entry.credit_amount, entry.credit_currency ?? transfer.currency_code ?? "KWD")
        }))
      }
    ]
  };
}

async function getIdRequestPreview(session: SessionUser, requestUuid: string): Promise<HubPreview | null> {
  if (session.role !== "inspector" && session.role !== "admin") return null;

  const request = await prisma.candidate_id_request.findUnique({
    where: { cir_uuid: requestUuid },
    select: {
      cir_uuid: true,
      candidate_ids: true,
      status: true,
      created_at: true,
      updated_at: true,
      staff_candidate_id_request_created_byTostaff: { select: { staff_name: true } },
      staff_candidate_id_request_updated_byTostaff: { select: { staff_name: true } }
    }
  });

  if (!request) return null;

  const candidateIds = parseCandidateIds(request.candidate_ids).slice(0, 8);
  const candidates = candidateIds.length
    ? await prisma.candidate.findMany({
        where: { candidate_id: { in: candidateIds }, deleted: 0 },
        orderBy: { candidate_updated_at: "desc" },
        select: {
          candidate_id: true,
          candidate_name: true,
          candidate_email: true,
          candidate_civil_need_verification: true,
          candidate_updated_at: true
        }
      })
    : [];

  const href = session.role === "inspector" ? (`/inspector/id-requests/${request.cir_uuid}` as Route) : undefined;
  const actions = href ? [{ label: "Open full record", href }] : [];

  return {
    id: `id-${request.cir_uuid}`,
    type: "ID Request",
    title: `ID batch ${request.cir_uuid.slice(0, 12)}`,
    subtitle: `${parseCandidateIds(request.candidate_ids).length} candidate IDs`,
    meta: `${request.status ?? "pending"} · ${formatDate(request.created_at)}`,
    href,
    actions,
    flags: [
      request.status ?? "pending",
      `${candidates.length} candidate records loaded`,
      candidates.some((candidate) => candidate.candidate_civil_need_verification) ? "Verification required" : "No active verification flag"
    ],
    facts: [
      { label: "Batch UUID", value: request.cir_uuid.slice(0, 18) },
      { label: "Candidates", value: parseCandidateIds(request.candidate_ids).length },
      { label: "Created by", value: request.staff_candidate_id_request_created_byTostaff?.staff_name ?? "Unknown" },
      { label: "Updated by", value: request.staff_candidate_id_request_updated_byTostaff?.staff_name ?? "Unknown" },
      { label: "Created", value: formatDate(request.created_at) },
      { label: "Updated", value: formatDate(request.updated_at) }
    ],
    related: [
      {
        title: "Candidate records",
        rows: candidates.map((candidate) => ({
          id: candidate.candidate_id,
          title: candidate.candidate_name,
          subtitle: candidate.candidate_email,
          meta: `${candidate.candidate_civil_need_verification ? "Needs civil ID review" : "Civil ID clear"} · ${formatDate(candidate.candidate_updated_at)}`,
          href: candidateHref(session, candidate.candidate_id)
        }))
      }
    ]
  };
}

async function searchCompanies(session: SessionUser, query: string, companyIds: number[]) {
  if (!["admin", "company"].includes(session.role)) return [];

  const numeric = Number(query);
  const where: Prisma.companyWhereInput = {
    deleted: 0,
    ...(session.role === "company" ? { company_id: { in: companyIds } } : {})
  };

  if (query) {
    where.OR = [
      { company_name: { contains: query } },
      { company_email: { contains: query } },
      ...(Number.isInteger(numeric) ? [{ company_id: numeric }] : [])
    ];
  }

  return prisma.company.findMany({
    where,
    orderBy: { company_updated_at: "desc" },
    take: query ? 8 : 4,
    select: {
      company_id: true,
      company_name: true,
      company_email: true,
      company_approved_to_hire: true,
      company_hourly_rate: true,
      currency_code: true,
      no_of_active_requests: true
    }
  });
}

async function searchRequests(session: SessionUser, query: string, companyIds: number[]) {
  const where: Prisma.requestWhereInput = {
    ...(session.role === "staff" ? { staff_id: Number(session.id) } : {}),
    ...(session.role === "company" ? { company_id: { in: companyIds } } : {})
  };

  if (session.role === "candidate" || session.role === "inspector") return [];

  if (query) {
    where.OR = [
      { request_uuid: { contains: query } },
      { request_position_title: { contains: query } },
      { company: { company_name: { contains: query } } }
    ];
  }

  return prisma.request.findMany({
    where,
    orderBy: { request_updated_datetime: "desc" },
    take: query ? 8 : 5,
    select: {
      request_uuid: true,
      request_position_title: true,
      request_status: true,
      request_number_of_employees: true,
      request_updated_datetime: true,
      company: { select: { company_name: true } }
    }
  });
}

async function searchTransfers(session: SessionUser, query: string) {
  if (session.role !== "admin") return [];

  const numeric = Number(query);
  const where: Prisma.transferWhereInput = {
    deleted: 0,
    ...(query
      ? {
          OR: [
            ...(Number.isInteger(numeric) ? [{ transfer_id: numeric }] : []),
            { company: { company_name: { contains: query } } }
          ]
        }
      : {})
  };

  return prisma.transfer.findMany({
    where,
    orderBy: { transfer_updated_at: "desc" },
    take: query ? 8 : 4,
    select: {
      transfer_id: true,
      transfer_status: true,
      total: true,
      company_total: true,
      currency_code: true,
      start_date: true,
      end_date: true,
      company: { select: { company_name: true } }
    }
  });
}

async function searchIdRequests(session: SessionUser, query: string) {
  if (session.role !== "inspector" && session.role !== "admin") return [];

  const where: Prisma.candidate_id_requestWhereInput = query
    ? {
        OR: [{ cir_uuid: { contains: query } }, { status: { contains: query } }, { candidate_ids: { contains: query } }]
      }
    : {};

  return prisma.candidate_id_request.findMany({
    where,
    orderBy: { created_at: "desc" },
    take: query ? 8 : 4,
    select: {
      cir_uuid: true,
      candidate_ids: true,
      status: true,
      created_at: true
    }
  });
}

async function companyIdsForContact(contactUuid: string) {
  const links = await prisma.company_contact.findMany({
    where: { contact_uuid: contactUuid, allow_access: true },
    select: { company_id: true }
  });
  return links.map((link) => link.company_id).filter((id): id is number => Boolean(id));
}

async function candidateIdsForStaff(staffId: number) {
  const histories = await prisma.candidate_work_history.findMany({
    where: { staff_id: staffId, candidate_id: { not: null } },
    distinct: ["candidate_id"],
    orderBy: { end_date: "desc" },
    take: 500,
    select: { candidate_id: true }
  });
  return histories.map((history) => history.candidate_id).filter((id): id is number => Boolean(id));
}

async function canStaffAccessCandidate(staffId: number, candidateId: number) {
  const match = await prisma.candidate_work_history.findFirst({
    where: { staff_id: staffId, candidate_id: candidateId },
    select: { id: true }
  });
  return Boolean(match);
}

function parseCandidateIds(value: string | null | undefined) {
  if (!value) return [];
  return value
    .split(/[^0-9]+/)
    .map((item) => Number(item))
    .filter((item) => Number.isInteger(item) && item > 0);
}

function candidateHref(session: SessionUser, candidateId: number) {
  if (session.role === "admin") return `/admin/candidates/${candidateId}` as Route;
  if (session.role === "staff") return `/staff/candidates/${candidateId}` as Route;
  if (session.role === "candidate" && Number(session.id) === candidateId) return "/candidate" as Route;
  return undefined;
}

function candidateListHref(session: SessionUser, filter: "needs-review" | "incomplete") {
  if (session.role === "admin") return "/admin/candidates" as Route;
  if (session.role === "staff") return `/staff/candidates?filter=${filter}` as Route;
  return undefined;
}

function companyHref(session: SessionUser, companyId: number) {
  if (session.role === "admin") return `/admin/companies/${companyId}` as Route;
  if (session.role === "company") return `/company/companies/${companyId}` as Route;
  return undefined;
}

function requestHref(session: SessionUser, requestUuid: string) {
  if (session.role === "admin") return `/admin/requests/${requestUuid}` as Route;
  if (session.role === "staff") return `/staff/requests/${requestUuid}` as Route;
  if (session.role === "company") return `/company/requests/${requestUuid}` as Route;
  return undefined;
}

function requestListHref(session: SessionUser) {
  if (session.role === "admin") return "/admin/requests" as Route;
  if (session.role === "staff") return "/staff/requests" as Route;
  if (session.role === "company") return "/company/requests" as Route;
  return undefined;
}

function workspaceNavigation(role: Role): HubNavigationItem[] {
  const shared = [{ label: "Command", description: "Search and triage", href: "/app" as Route }];
  const items: Record<Role, HubNavigationItem[]> = {
    admin: [
      ...shared,
      { label: "Candidates", description: "Approval and profiles", href: "/admin/candidates" as Route },
      { label: "Companies", description: "Employer accounts", href: "/admin/companies" as Route },
      { label: "Requests", description: "Hiring pipeline", href: "/admin/requests" as Route },
      { label: "Transfers", description: "Payroll records", href: "/admin/transfers" as Route }
    ],
    staff: [
      ...shared,
      { label: "My requests", description: "Assigned demand", href: "/staff/requests" as Route },
      { label: "My candidates", description: "Assigned candidate records", href: "/staff/candidates" as Route }
    ],
    candidate: [
      ...shared,
      { label: "Invitations", description: "Job invitations", href: "/candidate/invitations" as Route },
      { label: "Work logs", description: "Shifts and history", href: "/candidate/work-logs" as Route }
    ],
    company: [
      ...shared,
      { label: "Company profile", description: "Linked accounts", href: "/company/companies" as Route },
      { label: "Requests", description: "Hiring requests", href: "/company/requests" as Route }
    ],
    inspector: [
      ...shared,
      { label: "ID requests", description: "Civil ID batches", href: "/inspector/id-requests" as Route }
    ]
  };
  return items[role];
}

function accessSummary(role: Role) {
  const summaries: Record<Role, { title: string; note: string; items: string[] }> = {
    admin: {
      title: "Admin access",
      note: "This account can operate across the imported system.",
      items: ["Candidate approvals", "Employer accounts", "Requests", "Payroll transfers"]
    },
    staff: {
      title: "Staff access",
      note: "This account only shows assigned requests and candidate records connected to this staff member.",
      items: ["Assigned requests", "Assigned candidates", "Related notes", "Related work history"]
    },
    candidate: {
      title: "Candidate access",
      note: "This account only shows the signed-in candidate profile, invitations, and work logs.",
      items: ["Own profile", "Own invitations", "Own work logs"]
    },
    company: {
      title: "Company access",
      note: "This account only shows companies and requests linked to this company contact.",
      items: ["Linked companies", "Company requests", "Company contacts", "Stores"]
    },
    inspector: {
      title: "Inspector access",
      note: "This account only shows civil ID verification queues.",
      items: ["ID request batches", "Candidate records inside ID batches"]
    }
  };
  return summaries[role];
}
