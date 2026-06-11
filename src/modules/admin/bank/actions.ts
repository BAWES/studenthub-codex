"use server";

// ---------------------------------------------------------------------------
// AdminBankController — Bank CRUD server actions
// ---------------------------------------------------------------------------
// Ported from Yii2 admin/modules/v1/controllers/BankController.php
//
// Actions:
//   - listBanks   — paginated list of active (non-deleted) banks
//   - createBank  — create a new bank record
//
// The Yii2 controller also had view/update/delete — those are not part of this
// port scope. The legacy controller returns {operation, message} for mutations.
// ---------------------------------------------------------------------------

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import type { Prisma } from "@prisma/client";
import {
  bankItemSchema,
  bankOperationResultSchema,
  createBankSchema,
  listBanksResultSchema,
  listBanksSchema,
} from "./schemas";
import type { BankItem, BankOperationResult, ListBanksResult } from "./schemas";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ListBanksParams = z.input<typeof listBanksSchema>;
export type CreateBankParams = z.input<typeof createBankSchema>;


// ---------------------------------------------------------------------------
// listBanks
// ---------------------------------------------------------------------------

/**
 * List active (non-deleted) banks with pagination and sorting.
 *
 * Mirrors the legacy AdminBankController::actionList() which returned all
 * banks via ActiveDataProvider. The Next.js port filters to `deleted = 0`
 * and supports configurable sort/pagination.
 */
export async function listBanks(
  params: ListBanksParams = {},
): Promise<ListBanksResult> {
  await requireCapability("admin.read");

  const parsed = listBanksSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? "Invalid list parameters",
    );
  }

  const { sortBy, sortDir, page, limit } = parsed.data;

  const where: Prisma.bankWhereInput = {
    deleted: 0,
  };

  const orderByFieldMap: Record<string, string> = {
    bank_id: "bank_id",
    bank_name: "bank_name",
    bank_iban_code: "bank_iban_code",
    bank_swift_code: "bank_swift_code",
  };

  const orderBy = {
    [orderByFieldMap[sortBy] || "bank_name"]: sortDir,
  };

  const skip = (page - 1) * limit;

  const [rows, total] = await Promise.all([
    prisma.bank.findMany({
      where,
      skip,
      take: limit,
      orderBy,
    }),
    prisma.bank.count({ where }),
  ]);

  const result: ListBanksResult = {
    banks: rows.map((row) => ({
      bank_id: row.bank_id,
      bank_name: row.bank_name,
      bank_iban_code: row.bank_iban_code,
      bank_swift_code: row.bank_swift_code,
      bank_code_abk: row.bank_code_abk,
      bank_address: row.bank_address,
      bank_transfer_type: row.bank_transfer_type,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  // Validate output shape
  const outputParsed = listBanksResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/admin/bank] listBanks output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// createBank
// ---------------------------------------------------------------------------

/**
 * Create a new bank record.
 *
 * Mirrors the legacy AdminBankController::actionCreate() which accepted
 * name, swift_code, address, bank_iban_code, type, bank_code_abk.
 * Returns {operation, message} matching the Yii2 response shape.
 */
export async function createBank(
  params: CreateBankParams,
): Promise<{ operation: string; message: string }> {
  await requireCapability("admin.write");

  const parsed = createBankSchema.safeParse(params);
  if (!parsed.success) {
    return {
      operation: "error",
      message:
        parsed.error.issues[0]?.message ?? "Invalid create parameters",
    };
  }

  const { name, swift_code, address, bank_iban_code, type, bank_code_abk } =
    parsed.data;

  try {
    await prisma.bank.create({
      data: {
        bank_name: name ?? null,
        bank_swift_code: swift_code ?? null,
        bank_address: address ?? null,
        bank_iban_code,
        bank_transfer_type: type ?? null,
        bank_code_abk: bank_code_abk ?? null,
      },
    });

    const result: BankOperationResult = {
      operation: "success",
      message: "Bank created successfully",
    };

    // Validate output shape
    const outputParsed = bankOperationResultSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[modules/admin/bank] createBank output validation failed:",
        outputParsed.error.issues,
      );
    }

    return result;
  } catch (error) {
    return {
      operation: "error",
      message:
        "We've faced a problem creating the bank, please contact us for assistance.",
    };
  }
}
