"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/modules/auth/session";
import type { Prisma } from "@prisma/client";

export type PaletteCandidateResult = {
  id: string;
  name: string;
  email: string;
  status: string;
  country: string;
};

/**
 * Searches candidates globally for use in the command palette.
 * Mirrors the search logic from data.ts but returns a simplified
 * result suitable for inline rendering inside CommandDialog items.
 */
export async function searchCandidatesForPalette(
  query: string,
): Promise<PaletteCandidateResult[]> {
  const session = await requireSession();
  if (!["admin", "staff", "candidate"].includes(session.role)) return [];

  const numeric = Number(query);
  const where: Prisma.candidateWhereInput = {
    deleted: 0,
    ...(session.role === "candidate"
      ? { candidate_id: Number(session.id) }
      : {}),
  };

  if (query) {
    where.OR = [
      { candidate_name: { contains: query } },
      { candidate_email: { contains: query } },
      ...(Number.isInteger(numeric) ? [{ candidate_id: numeric }] : []),
    ];
  }

  const rows = await prisma.candidate.findMany({
    where,
    orderBy: { candidate_updated_at: "desc" },
    take: 12,
    select: {
      candidate_id: true,
      candidate_name: true,
      candidate_email: true,
      candidate_status: true,
      approved: true,
      country: { select: { country_name_en: true } },
    },
  });

  return rows.map((row) => ({
    id: String(row.candidate_id),
    name: row.candidate_name ?? "Unknown",
    email: row.candidate_email ?? "",
    status:
      row.approved === 0
        ? "Needs review"
        : row.candidate_status === 10
          ? "Active"
          : `Status ${row.candidate_status}`,
    country: row.country?.country_name_en ?? "",
  }));
}
