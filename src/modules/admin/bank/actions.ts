"use server";

// ---------------------------------------------------------------------------
// AdminBankController — Bank CRUD server actions
// ---------------------------------------------------------------------------
// Ported from Yii2 admin/modules/v1/controllers/BankController.php
//
// Actions:
//   - listBanks   — paginated list of active (non-deleted) banks
//   - getBank     — single bank detail with candidate count
//   - createBank  — create a new bank record
//   - updateBank  — update a bank's fields (partial)
//   - deleteBank  — soft-delete a bank
//
// The Yii2 controller returned {operation, message} for mutations.
// ---------------------------------------------------------------------------

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  bankDetailOutputSchema,
  bankMutationOutputSchema,
  listBanksOutputSchema,
  createBankSchema,
  deleteBankSchema,
  getBankSchema,
  listBanksSchema,
  updateBankSchema,
  type BankActionResponse,
  type BankDetail,
  type BankRow,
  type CreateBankInput,
  type DeleteBankInput,
  type ListBanksInput,
  type UpdateBankInput,
} from "./schemas";

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function logOutputError(source: string, error: unknown): void {
  console.error(`[modules/admin/bank] ${source} output failed:`, error);
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ListBanksParams = z.input<typeof listBanksSchema>;
export type CreateBankParams = z.input<typeof createBankSchema>;

// ---------------------------------------------------------------------------
// listBanks
// ---------------------------------------------------------------------------

/**
 * List banks with pagination and optional text search across name, IBAN, SWIFT.
 */
export async function listBanks(
  input: ListBanksInput = {},
): Promise<{
  items: BankRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  await requireCapability("admin.read");

  const parsed = listBanksSchema.safeParse(input);
  if (!parsed.success) {
    return { items: [], total: 0, page: 1, limit: 20, totalPages: 0 };
  }

  const { page, limit, q } = parsed.data;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {
    deleted: 0,
  };
  if (q && q.trim().length > 0) {
    where.OR = [
      { bank_name: { contains: q.trim() } },
      { bank_iban_code: { contains: q.trim() } },
      { bank_swift_code: { contains: q.trim() } },
    ];
  }

  const [banks, total] = await Promise.all([
    prisma.bank.findMany({
      where: where as any,
      orderBy: { bank_id: "asc" },
      skip,
      take: limit,
      include: {
        _count: { select: { candidate: true } },
      },
    }),
    prisma.bank.count({ where: where as any }),
  ]);

  const result = {
    items: banks.map((b): BankRow => ({
      bank_id: b.bank_id,
      bank_name: b.bank_name,
      bank_iban_code: b.bank_iban_code,
      bank_swift_code: b.bank_swift_code,
      bank_code_abk: b.bank_code_abk,
      bank_address: b.bank_address,
      bank_transfer_type: b.bank_transfer_type,
      candidate_count: b._count?.candidate ?? 0,
      created_at: null,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  // Validate output shape
  const outputParsed = listBanksOutputSchema.safeParse(result);
  if (!outputParsed.success) {
    logOutputError("listBanks", outputParsed.error.issues);
  }

  return result;
}

// ---------------------------------------------------------------------------
// getBank
// ---------------------------------------------------------------------------

/**
 * Get a single bank by ID with candidate count.
 */
export async function getBank(
  bankId: number,
): Promise<BankDetail> {
  await requireCapability("admin.read");

  const parsed = getBankSchema.safeParse({ bankId });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid bank ID");
  }

  const bank = await prisma.bank.findFirst({
    where: { bank_id: parsed.data.bankId, deleted: 0 },
    include: {
      _count: { select: { candidate: true } },
    },
  });

  if (!bank) {
    return { bank: null as any, candidate_count: 0 };
  }

  const result = {
    bank: {
      bank_id: bank.bank_id,
      bank_name: bank.bank_name,
      bank_iban_code: bank.bank_iban_code,
      bank_swift_code: bank.bank_swift_code,
      bank_code_abk: bank.bank_code_abk,
      bank_address: bank.bank_address,
      bank_transfer_type: bank.bank_transfer_type,
    },
    candidate_count: bank._count?.candidate ?? 0,
  };

  // Validate output shape
  const outputParsed = bankDetailOutputSchema.safeParse(result);
  if (!outputParsed.success) {
    logOutputError("getBank", outputParsed.error.issues);
  }

  return result;
}

// ---------------------------------------------------------------------------
// createBank
// ---------------------------------------------------------------------------

/**
 * Create a new bank account entry.
 */
export async function createBank(
  input: CreateBankInput,
): Promise<BankActionResponse> {
  await requireCapability("admin.write");

  const parsed = createBankSchema.safeParse(input);
  if (!parsed.success) {
    return {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  try {
    const bank = await prisma.bank.create({
      data: {
        bank_name: parsed.data.bankName,
        bank_iban_code: parsed.data.bankIbanCode,
        bank_swift_code: parsed.data.bankSwiftCode ?? null,
        bank_code_abk: parsed.data.bankCodeAbk ?? null,
        bank_address: parsed.data.bankAddress ?? null,
        bank_transfer_type: parsed.data.bankTransferType ?? null,
      },
    });

    revalidatePath("/admin/bank");

    const result: BankActionResponse = {
      operation: "success",
      message: `Bank "${bank.bank_name ?? bank.bank_iban_code}" created`,
      data: {
        bank_id: bank.bank_id,
        bank_name: bank.bank_name,
        bank_iban_code: bank.bank_iban_code,
        bank_swift_code: bank.bank_swift_code,
        bank_code_abk: bank.bank_code_abk,
        bank_address: bank.bank_address,
        bank_transfer_type: bank.bank_transfer_type,
      },
    };

    // Validate output shape
    const outputParsed = bankMutationOutputSchema.safeParse(result);
    if (!outputParsed.success) {
      logOutputError("createBank", outputParsed.error.issues);
    }

    return result;
  } catch (err) {
    return {
      operation: "error",
      message: err instanceof Error ? err.message : "Failed to create bank",
    };
  }
}

// ---------------------------------------------------------------------------
// updateBank
// ---------------------------------------------------------------------------

/**
 * Update a bank's fields. Only provided fields are modified.
 */
export async function updateBank(
  input: UpdateBankInput,
): Promise<BankActionResponse> {
  await requireCapability("admin.write");

  const parsed = updateBankSchema.safeParse(input);
  if (!parsed.success) {
    return {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const existing = await prisma.bank.findFirst({
    where: { bank_id: parsed.data.bankId, deleted: 0 },
    select: { bank_id: true, bank_name: true },
  });

  if (!existing) {
    return { operation: "error", message: "Bank not found" };
  }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.bankName !== undefined) updateData.bank_name = parsed.data.bankName;
  if (parsed.data.bankIbanCode !== undefined) updateData.bank_iban_code = parsed.data.bankIbanCode;
  if (parsed.data.bankSwiftCode !== undefined) updateData.bank_swift_code = parsed.data.bankSwiftCode;
  if (parsed.data.bankCodeAbk !== undefined) updateData.bank_code_abk = parsed.data.bankCodeAbk;
  if (parsed.data.bankAddress !== undefined) updateData.bank_address = parsed.data.bankAddress;
  if (parsed.data.bankTransferType !== undefined) updateData.bank_transfer_type = parsed.data.bankTransferType;

  try {
    const bank = await prisma.bank.update({
      where: { bank_id: parsed.data.bankId },
      data: updateData as any,
    });

    revalidatePath("/admin/bank");
    revalidatePath(`/admin/bank/${parsed.data.bankId}`);

    const result: BankActionResponse = {
      operation: "success",
      message: `Bank "${bank.bank_name ?? bank.bank_iban_code}" updated`,
      data: {
        bank_id: bank.bank_id,
        bank_name: bank.bank_name,
        bank_iban_code: bank.bank_iban_code,
        bank_swift_code: bank.bank_swift_code,
        bank_code_abk: bank.bank_code_abk,
        bank_address: bank.bank_address,
        bank_transfer_type: bank.bank_transfer_type,
      },
    };

    // Validate output shape
    const outputParsed = bankMutationOutputSchema.safeParse(result);
    if (!outputParsed.success) {
      logOutputError("updateBank", outputParsed.error.issues);
    }

    return result;
  } catch (err) {
    return {
      operation: "error",
      message: err instanceof Error ? err.message : "Failed to update bank",
    };
  }
}

// ---------------------------------------------------------------------------
// deleteBank
// ---------------------------------------------------------------------------

/**
 * Soft-delete a bank. Refuses if candidates are still assigned.
 */
export async function deleteBank(
  input: DeleteBankInput,
): Promise<BankActionResponse> {
  await requireCapability("admin.write");

  const parsed = deleteBankSchema.safeParse(input);
  if (!parsed.success) {
    return {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const existing = await prisma.bank.findFirst({
    where: { bank_id: parsed.data.bankId, deleted: 0 },
    include: {
      _count: { select: { candidate: true } },
    },
  });

  if (!existing) {
    return { operation: "error", message: "Bank not found or already deleted" };
  }

  if ((existing._count?.candidate ?? 0) > 0) {
    return {
      operation: "error",
      message: `Bank already assigned to ${existing._count.candidate} candidate(s)`,
    };
  }

  try {
    await prisma.bank.update({
      where: { bank_id: parsed.data.bankId },
      data: { deleted: 1 },
    });

    revalidatePath("/admin/bank");

    const result: BankActionResponse = { operation: "success", message: "Bank deleted successfully" };

    // Validate output shape
    const outputParsed = bankMutationOutputSchema.safeParse(result);
    if (!outputParsed.success) {
      logOutputError("deleteBank", outputParsed.error.issues);
    }

    return result;
  } catch (err) {
    return {
      operation: "error",
      message: err instanceof Error ? err.message : "Failed to delete bank",
    };
  }
}
