import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { SessionUser } from "@/modules/auth/types";
import { formatDate, formatMoney } from "@/modules/workspace/format";

export type CandidateRow = {
  id: number;
  name: string;
  email: string;
  country: string;
  status: string;
  rate: string;
  updated: string;
};

export type CandidateFilters = {
  search?: string;
  status?: "active" | "needs-review" | "incomplete" | "civil-id" | "all";
  limit?: number;
};

export async function getCandidates(session: SessionUser, filters?: CandidateFilters) {
  const where = await buildCandidateWhere(session, filters);
  const limit = filters?.limit ?? 60;

  const rows = await prisma.candidate.findMany({
    where,
    orderBy: { candidate_updated_at: "desc" },
    take: limit,
    select: {
      candidate_id: true,
      candidate_name: true,
      candidate_email: true,
      candidate_status: true,
      approved: true,
      candidate_hourly_rate: true,
      currency_code: true,
      candidate_updated_at: true,
      country: { select: { country_name_en: true } }
    }
  });

  return rows.map(toCandidateRow);
}

async function buildCandidateWhere(
  session: SessionUser,
  filters?: CandidateFilters
): Promise<Prisma.candidateWhereInput> {
  const scopeWhere = session.role === "staff" ? await staffScopeWhere(Number(session.id)) : {};
  const filterWhere = buildFilterWhere(filters);
  const searchWhere = buildSearchWhere(filters?.search);

  return {
    deleted: 0,
    ...scopeWhere,
    ...filterWhere,
    ...searchWhere
  };
}

async function staffScopeWhere(staffId: number): Promise<Prisma.candidateWhereInput> {
  const histories = await prisma.candidate_work_history.findMany({
    where: { staff_id: staffId, candidate_id: { not: null } },
    distinct: ["candidate_id"],
    select: { candidate_id: true }
  });
  const candidateIds = histories.map((h) => h.candidate_id).filter((id): id is number => Boolean(id));
  return candidateIds.length ? { candidate_id: { in: candidateIds } } : { candidate_id: -1 };
}

function buildFilterWhere(filters?: CandidateFilters): Prisma.candidateWhereInput {
  if (!filters?.status || filters.status === "all") return {};

  switch (filters.status) {
    case "active":
      return { candidate_status: 10, approved: { not: 0 } };
    case "needs-review":
      return { approved: 0 };
    case "incomplete":
      return { is_incomplete_profile: true };
    case "civil-id":
      return { candidate_civil_need_verification: true };
    default:
      return {};
  }
}

function buildSearchWhere(search?: string): Prisma.candidateWhereInput {
  if (!search?.trim()) return {};

  const query = search.trim();
  const numeric = Number(query);

  return {
    OR: [
      { candidate_name: { contains: query } },
      { candidate_email: { contains: query } },
      { candidate_phone: { contains: query } },
      { candidate_uid: { contains: query } },
      ...(Number.isInteger(numeric) ? [{ candidate_id: numeric }] : [])
    ]
  };
}

type CandidateSelect = {
  candidate_id: number;
  candidate_name: string;
  candidate_email: string;
  candidate_status: number | null;
  approved: number;
  candidate_hourly_rate: unknown;
  currency_code: string | null;
  candidate_updated_at: Date | null;
  country: { country_name_en: string } | null;
};

export async function getCandidateIdsForStaff(staffId: number) {
  const rows = await prisma.candidate_work_history.findMany({
    where: { staff_id: staffId, candidate_id: { not: null } },
    distinct: ["candidate_id"],
    orderBy: { end_date: "desc" },
    take: 500,
    select: { candidate_id: true }
  });
  return rows.map((row) => row.candidate_id).filter((id): id is number => Boolean(id));
}

export function toCandidateRow(row: CandidateSelect): CandidateRow {
  return {
    id: row.candidate_id,
    name: row.candidate_name,
    email: row.candidate_email,
    country: row.country?.country_name_en ?? "No country",
    status:
      row.approved === 0
        ? "Needs review"
        : row.candidate_status === 10
          ? "Active"
          : `Status ${row.candidate_status}`,
    rate: formatMoney(row.candidate_hourly_rate, row.currency_code ?? "KWD"),
    updated: formatDate(row.candidate_updated_at)
  };
}
