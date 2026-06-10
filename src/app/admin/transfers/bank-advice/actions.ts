"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  listTransferBankAdvicesSchema,
  getTransferBankAdviceSchema,
  createTransferBankAdviceSchema,
  updateTransferBankAdviceSchema,
  deleteTransferBankAdviceSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ListTransferBankAdvicesInput = z.input<typeof listTransferBankAdvicesSchema>;
export type CreateTransferBankAdviceInput = z.input<typeof createTransferBankAdviceSchema>;
export type UpdateTransferBankAdviceInput = z.input<typeof updateTransferBankAdviceSchema>;

export type TransferBankAdviceListItem = {
  tba_uuid: string;
  serial_no: number | null;
  file_path: string | null;
  created_by: number | null;
  created_at: Date | null;
  updated_at: Date | null;
  is_deleted: boolean | null;
};

export type TransferBankAdviceDetail = TransferBankAdviceListItem;

export type ListTransferBankAdvicesResult = {
  advices: TransferBankAdviceListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

// ---------------------------------------------------------------------------
// Server actions
// ---------------------------------------------------------------------------

/**
 * List transfer bank advices with pagination.
 * Excludes soft-deleted records.
 * Mirrors the legacy TransferBankAdviceController::actionList().
 */
export async function listTransferBankAdvices(
  params: ListTransferBankAdvicesInput = {},
): Promise<ListTransferBankAdvicesResult> {
  await requireCapability("finance.read");

  const parsed = listTransferBankAdvicesSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid list parameters");
  }

  const { page, limit } = parsed.data;

  const where = { is_deleted: false };

  const [raw, total] = await Promise.all([
    prisma.transfer_bank_advice.findMany({
      where: where as any,
      orderBy: { created_at: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.transfer_bank_advice.count({ where: where as any }),
  ]);

  return {
    advices: raw as TransferBankAdviceListItem[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Get a single transfer bank advice by UUID.
 * Mirrors the legacy TransferBankAdviceController::actionView().
 */
export async function getTransferBankAdvice(
  uuid: string,
): Promise<TransferBankAdviceDetail | null> {
  await requireCapability("finance.read");

  const parsed = getTransferBankAdviceSchema.safeParse({ uuid });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid transfer bank advice UUID");
  }

  const advice = await prisma.transfer_bank_advice.findUnique({
    where: { tba_uuid: parsed.data.uuid },
  });

  if (!advice || advice.is_deleted) return null;

  return advice as TransferBankAdviceDetail;
}

/**
 * Create a new transfer bank advice record.
 * Mirrors the legacy TransferBankAdviceController::actionCreate().
 */
export async function createTransferBankAdvice(
  data: CreateTransferBankAdviceInput,
): Promise<{ tba_uuid: string }> {
  await requireCapability("finance.mutate");

  const parsed = createTransferBankAdviceSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid transfer bank advice data");
  }

  const advice = await prisma.transfer_bank_advice.create({
    data: {
      tba_uuid: crypto.randomUUID(),
      file_path: parsed.data.file_path,
      created_at: new Date(),
      updated_at: new Date(),
      is_deleted: false,
    } as any,
  });

  revalidatePath("/admin/transfers");
  return { tba_uuid: advice.tba_uuid };
}

/**
 * Update an existing transfer bank advice file path.
 * Mirrors the legacy TransferBankAdviceController::actionUpdate().
 */
export async function updateTransferBankAdvice(
  data: UpdateTransferBankAdviceInput,
): Promise<{ tba_uuid: string }> {
  await requireCapability("finance.mutate");

  const parsed = updateTransferBankAdviceSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid transfer bank advice data");
  }

  await prisma.transfer_bank_advice.update({
    where: { tba_uuid: parsed.data.uuid },
    data: {
      file_path: parsed.data.file_path,
      updated_at: new Date(),
    } as any,
  });

  revalidatePath("/admin/transfers");
  return { tba_uuid: parsed.data.uuid };
}

/**
 * Soft-delete a transfer bank advice record.
 * Mirrors the legacy TransferBankAdviceController::actionDelete().
 */
export async function deleteTransferBankAdvice(
  uuid: string,
): Promise<{ tba_uuid: string }> {
  await requireCapability("finance.mutate");

  const parsed = deleteTransferBankAdviceSchema.safeParse({ uuid });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid transfer bank advice UUID");
  }

  await prisma.transfer_bank_advice.update({
    where: { tba_uuid: parsed.data.uuid },
    data: {
      is_deleted: true,
      updated_at: new Date(),
    } as any,
  });

  revalidatePath("/admin/transfers");
  return { tba_uuid: parsed.data.uuid };
}
