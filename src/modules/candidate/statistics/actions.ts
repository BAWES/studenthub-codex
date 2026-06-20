"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import type { request_request_status } from "@prisma/client";
import {
  candidateDashboardStatsSchema,
  type CandidateDashboardStats,
} from "./schemas";

// ---------------------------------------------------------------------------
// Constants (mirroring Yii2 PHP values)
// ---------------------------------------------------------------------------

const INTERVIEW_STATUS_SCHEDULED = 1 as const;
const INVOICE_STATUS_PAID = "paid" as const;

/** Request statuses considered "closed" — exclude from interview counting. */
const EXCLUDED_REQUEST_STATUSES: request_request_status[] = [
  "delivered",
  "finished_by_recruitment",
  "cancelled",
];

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const candidateIdSchema = z.object({
  candidateId: z.number().int().positive(),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type GetCandidateDashboardStatsParams = z.input<typeof candidateIdSchema>;

// ---------------------------------------------------------------------------
// Server actions
// ---------------------------------------------------------------------------

/**
 * Get candidate dashboard statistics.
 *
 * Ported from candidate StatisticController::actionList().
 * Returns aggregated work history (hours, pay, bonus) and upcoming interview count
 * for a single candidate.
 */
export async function getCandidateDashboardStats(
  params: GetCandidateDashboardStatsParams,
): Promise<CandidateDashboardStats> {
  await requireCapability("candidate.read.own");

  const parsed = candidateIdSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid candidate ID");
  }

  const { candidateId } = parsed.data;

  // Fetch candidate basic info
  const candidate = await prisma.candidate.findUnique({
    where: { candidate_id: candidateId },
    select: {
      candidate_name: true,
      candidate_email: true,
    },
  });

  // Fetch all transfer candidates for this candidate with invoice info
  const transferCandidates = await prisma.transfer_candidate.findMany({
    where: { candidate_id: candidateId, deleted: 0 },
    select: {
      hours: true,
      minutes: true,
      seconds: true,
      candidate_hourly_rate: true,
      bonus: true,
      bonus_commission: true,
      transfer: {
        select: {
          invoice: {
            select: {
              invoice_status: true,
            },
          },
        },
      },
    },
  });

  // Aggregate from transferCandidates (matching getAccountStatistic logic)
  let totalSeconds = 0;
  let totalMinutes = 0;
  let totalHours = 0;
  let totalPaid = 0;
  let totalBonus = 0;

  for (const tc of transferCandidates) {
    totalHours += tc.hours ?? 0;
    totalMinutes += tc.minutes ?? 0;
    totalSeconds += tc.seconds ?? 0;

    // invoice is an array — check if any paid invoice exists
    const invoices = tc.transfer?.invoice ?? [];
    const hasPaidInvoice = invoices.length > 0 && invoices.some(
      (inv) => Boolean(inv.invoice_status) && inv.invoice_status === INVOICE_STATUS_PAID,
    );
    if (hasPaidInvoice) {
      const hourlyRate = Number(tc.candidate_hourly_rate ?? 0);
      totalPaid += (tc.hours ?? 0) * hourlyRate;
      totalBonus += Number(tc.bonus ?? 0) - Number(tc.bonus_commission ?? 0);
    }
  }

  // Normalize time units (same logic as PHP getAccountStatistic)
  totalMinutes += Math.floor(totalSeconds / 60);
  totalHours += Math.floor(totalMinutes / 60);

  totalMinutes = totalMinutes % 60;
  totalSeconds = totalSeconds % 60;

  // Count upcoming scheduled interviews
  const totalInterviewScheduled = await prisma.request_interview.count({
    where: {
      candidate_id: candidateId,
      status: INTERVIEW_STATUS_SCHEDULED,
      interview_at: { gt: new Date() },
      request: {
        request_status: {
          notIn: EXCLUDED_REQUEST_STATUSES,
        },
      },
    },
  });

  const totalEarning = totalPaid + totalBonus;

  const result: CandidateDashboardStats = {
    totalHours,
    totalMinutes,
    totalSeconds,
    totalPaid,
    totalBonus,
    totalEarning,
    totalInterviewScheduled,
    candidateName: candidate?.candidate_name ?? null,
    candidateEmail: candidate?.candidate_email ?? null,
  };

  // Validate output shape
  const outputParsed = candidateDashboardStatsSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/candidate/statistics] getCandidateDashboardStats output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}
