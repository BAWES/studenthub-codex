"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const listContractsSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).optional(),
  type: z.string().optional(),
  status: z.number().int().optional(),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ListContractsParams = z.input<typeof listContractsSchema>;

export type ContractListItem = {
  contract_uuid: string;
  type: string;
  detail: string | null;
  start_date: Date | null;
  end_date: Date | null;
  transfer_cost: number | null;
  currency_code: string | null;
  status: number;
  created_at: Date | null;
};

export type ListContractsResult = {
  contracts: ContractListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

// ---------------------------------------------------------------------------
// Server actions
// ---------------------------------------------------------------------------

/**
 * List contracts with pagination and optional filters (type, status).
 * Mirrors the legacy ContractController pattern.
 */
export async function listContracts(
  params: ListContractsParams = {},
): Promise<ListContractsResult> {
  await requireCapability("candidate.read.own");

  const parsed = listContractsSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid list parameters");
  }

  const { page = 1, limit = 20, type, status } = parsed.data;

  // Build where clause: always exclude soft-deleted contracts
  const where: Record<string, unknown> = { deleted: false };
  if (type !== undefined) where.type = type;
  if (status !== undefined) where.status = status;

  const [contracts, total] = await Promise.all([
    prisma.contract.findMany({
      where: where as any,
      orderBy: { created_at: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        contract_uuid: true,
        type: true,
        detail: true,
        start_date: true,
        end_date: true,
        transfer_cost: true,
        currency_code: true,
        status: true,
        created_at: true,
      },
    }),
    prisma.contract.count({ where: where as any }),
  ]);

  return {
    contracts: contracts as ContractListItem[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
