// ---------------------------------------------------------------------------
// Database query functions for the hub workspace module
// ---------------------------------------------------------------------------

import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { Role, SessionUser } from "@/modules/auth/types";

// ---------------------------------------------------------------------------
// Candidate search
// ---------------------------------------------------------------------------

export async function searchCandidates(
  session: { role: Role; id: string },
  query: string,
  staffCandidateIds: number[],
) {
  if (!["admin", "staff", "candidate"].includes(session.role)) return [];
  if (session.role === "staff" && !staffCandidateIds.length) return [];

  const numeric = Number(query);
  const where: Prisma.candidateWhereInput = {
    deleted: 0,
    ...(session.role === "candidate"
      ? { candidate_id: Number(session.id) }
      : {}),
    ...(session.role === "staff"
      ? { candidate_id: { in: staffCandidateIds } }
      : {}),
  };

  if (query) {
    where.OR = [
      { candidate_name: { contains: query } },
      { candidate_email: { contains: query } },
      ...(Number.isInteger(numeric) ? [{ candidate_id: numeric }] : []),
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
      country: { select: { country_name_en: true } },
    },
  });
}

// ---------------------------------------------------------------------------
// Company search
// ---------------------------------------------------------------------------

export async function searchCompanies(
  session: { role: Role; id: string },
  query: string,
  companyIds: number[],
) {
  if (!["admin", "company"].includes(session.role)) return [];

  const numeric = Number(query);
  const where: Prisma.companyWhereInput = {
    deleted: 0,
    ...(session.role === "company"
      ? { company_id: { in: companyIds } }
      : {}),
  };

  if (query) {
    where.OR = [
      { company_name: { contains: query } },
      { company_email: { contains: query } },
      ...(Number.isInteger(numeric) ? [{ company_id: numeric }] : []),
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
      no_of_active_requests: true,
    },
  });
}

// ---------------------------------------------------------------------------
// Request search
// ---------------------------------------------------------------------------

export async function searchRequests(
  session: { role: Role; id: string },
  query: string,
  companyIds: number[],
) {
  const where: Prisma.requestWhereInput = {
    ...(session.role === "staff"
      ? { staff_id: Number(session.id) }
      : {}),
    ...(session.role === "company"
      ? { company_id: { in: companyIds } }
      : {}),
  };

  if (session.role === "candidate" || session.role === "inspector") return [];

  if (query) {
    where.OR = [
      { request_uuid: { contains: query } },
      { request_position_title: { contains: query } },
      { company: { company_name: { contains: query } } },
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
      company: { select: { company_name: true } },
    },
  });
}

// ---------------------------------------------------------------------------
// Transfer search
// ---------------------------------------------------------------------------

export async function searchTransfers(session: { role: Role }, query: string) {
  if (session.role !== "admin") return [];

  const numeric = Number(query);
  const where: Prisma.transferWhereInput = {
    deleted: 0,
    ...(query
      ? {
          OR: [
            ...(Number.isInteger(numeric)
              ? [{ transfer_id: numeric }]
              : []),
            { company: { company_name: { contains: query } } },
          ],
        }
      : {}),
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
      company: { select: { company_name: true } },
    },
  });
}

// ---------------------------------------------------------------------------
// ID request search
// ---------------------------------------------------------------------------

export async function searchIdRequests(session: { role: Role }, query: string) {
  if (session.role !== "inspector" && session.role !== "admin") return [];

  const where: Prisma.candidate_id_requestWhereInput = query
    ? {
        OR: [
          { cir_uuid: { contains: query } },
          { status: { contains: query } },
          { candidate_ids: { contains: query } },
        ],
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
      created_at: true,
    },
  });
}

// ---------------------------------------------------------------------------
// Permission helpers
// ---------------------------------------------------------------------------

export async function companyIdsForContact(contactUuid: string) {
  const links = await prisma.company_contact.findMany({
    where: { contact_uuid: contactUuid, allow_access: true },
    select: { company_id: true },
  });
  return links
    .map((link) => link.company_id)
    .filter((id): id is number => Boolean(id));
}

export async function candidateIdsForStaff(staffId: number) {
  const histories = await prisma.candidate_work_history.findMany({
    where: { staff_id: staffId, candidate_id: { not: null } },
    distinct: ["candidate_id"],
    orderBy: { end_date: "desc" },
    take: 500,
    select: { candidate_id: true },
  });
  return histories
    .map((history) => history.candidate_id)
    .filter((id): id is number => Boolean(id));
}

export async function canStaffAccessCandidate(
  staffId: number,
  candidateId: number,
) {
  const match = await prisma.candidate_work_history.findFirst({
    where: { staff_id: staffId, candidate_id: candidateId },
    select: { id: true },
  });
  return Boolean(match);
}
