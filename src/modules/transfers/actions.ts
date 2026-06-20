"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  transferListItemSchema,
  listTransfersResultSchema,
  type TransferListItem,
  type ListTransfersResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const listTransfersSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  companyId: z.coerce.number().int().positive().optional(),
  contractUuid: z.string().optional(),
  status: z.coerce.number().int().optional(),
});

const getTransferSchema = z.object({
  transferId: z.coerce.number().int().positive(),
});

// ---------------------------------------------------------------------------
// listTransfers
// ---------------------------------------------------------------------------

/**
 * List transfers with pagination and optional filtering.
 * Mirrors the legacy Yii2 TransferController::actionList().
 */
export async function listTransfers(
  params: FormData | z.input<typeof listTransfersSchema> = {},
): Promise<ListTransfersResult> {
  await requireCapability("transfer.read");

  const raw =
    params instanceof FormData
      ? {
          page: params.get("page"),
          limit: params.get("limit"),
          companyId: params.get("companyId"),
          contractUuid: params.get("contractUuid"),
          status: params.get("status"),
        }
      : params;

  const parsed = listTransfersSchema.safeParse(raw);
  if (!parsed.success) {
    return { transfers: [], total: 0, page: 1, limit: 20, totalPages: 0 };
  }

  const { page, limit, companyId, contractUuid, status } = parsed.data;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = { deleted: 0 };
  if (companyId !== undefined) where.company_id = companyId;
  if (contractUuid !== undefined) where.contract_uuid = contractUuid;
  if (status !== undefined) where.transfer_status = status;

  const [transfers, total] = await Promise.all([
    prisma.transfer.findMany({
      where: where as any,
      orderBy: { transfer_created_at: "desc" },
      skip,
      take: limit,
    }),
    prisma.transfer.count({ where: where as any }),
  ]);

  const result = {
    transfers: transfers.map((t: any): TransferListItem => ({
      transfer_id: t.transfer_id,
      company_id: t.company_id ?? null,
      contract_uuid: t.contract_uuid ?? null,
      contract_type: t.contract_type ?? null,
      total: t.total ? t.total.toString() : null,
      company_total: t.company_total ? t.company_total.toString() : null,
      transfer_status: t.transfer_status,
      currency_code: t.currency_code ?? null,
      start_date: t.start_date?.toISOString() ?? null,
      end_date: t.end_date?.toISOString() ?? null,
      created_at: t.transfer_created_at?.toISOString() ?? null,
      updated_at: t.transfer_updated_at?.toISOString() ?? null,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  // Validate output shape
  const outputParsed = listTransfersResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/transfers] listTransfers output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// getTransfer
// ---------------------------------------------------------------------------

/**
 * Get a single transfer by ID, excluding soft-deleted records.
 * Returns null if not found.
 */
export async function getTransfer(
  transferId: number,
): Promise<TransferListItem | null> {
  await requireCapability("transfer.read");

  const parsed = getTransferSchema.safeParse({ transferId });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid transfer ID");
  }

  const transfer = await prisma.transfer.findFirst({
    where: {
      transfer_id: parsed.data.transferId,
      deleted: 0,
    },
  });

  if (!transfer) return null;

  const raw = transfer as any;
  const item = {
    transfer_id: raw.transfer_id,
    company_id: raw.company_id ?? null,
    contract_uuid: raw.contract_uuid ?? null,
    contract_type: raw.contract_type ?? null,
    total: raw.total ? raw.total.toString() : null,
    company_total: raw.company_total ? raw.company_total.toString() : null,
    transfer_status: raw.transfer_status,
    currency_code: raw.currency_code ?? null,
    start_date: raw.start_date?.toISOString() ?? null,
    end_date: raw.end_date?.toISOString() ?? null,
    created_at: raw.transfer_created_at?.toISOString() ?? null,
    updated_at: raw.transfer_updated_at?.toISOString() ?? null,
  };

  // Validate output shape
  const outputParsed = transferListItemSchema.safeParse(item);
  if (!outputParsed.success) {
    console.error(
      "[modules/transfers] getTransfer output validation failed:",
      outputParsed.error.issues,
    );
  }

  return item;
}
