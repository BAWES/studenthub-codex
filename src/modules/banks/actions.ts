"use server";

import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  listBanksSchema,
  getBankSchema,
  createBankSchema,
  type ListBanksParams,
  type GetBankParams,
  type CreateBankParams,
  type BankListItem,
  type ListBanksResult,
  type CreateBankResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// Server actions
// ---------------------------------------------------------------------------

/**
 * List banks with pagination, excluding soft-deleted records.
 * Mirrors the legacy Yii2 Admin BankController::actionList().
 */
export async function listBanks(
  params: ListBanksParams = {},
): Promise<ListBanksResult> {
  await requireCapability("bank.read");

  const parsed = listBanksSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid list parameters");
  }

  const { page = 1, limit = 20 } = parsed.data;

  const where = { deleted: 0 };

  const [banks, total] = await Promise.all([
    prisma.bank.findMany({
      where,
      orderBy: { bank_name: "asc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.bank.count({ where }),
  ]);

  return {
    banks: banks as BankListItem[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Get a single bank by ID, excluding soft-deleted records.
 * Mirrors the legacy Yii2 Admin BankController::actionView().
 */
export async function getBank(
  params: GetBankParams,
): Promise<BankListItem | null> {
  await requireCapability("bank.read");

  const parsed = getBankSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid bank ID");
  }

  const { id } = parsed.data;

  const bank = await prisma.bank.findFirst({
    where: {
      bank_id: id,
      deleted: 0,
    },
  });

  return bank as BankListItem | null;
}

// ---------------------------------------------------------------------------
// Alias exports (matching the Yii2 BankController API naming convention)
// ---------------------------------------------------------------------------

/**
 * Alias for listBanks — matches the Yii2 BankController::actionList() naming.
 */
export const listBankAccounts = listBanks;

/**
 * Alias for getBank — matches the Yii2 BankController::actionView() naming.
 */
export const getBankAccount = getBank;

/**
 * Create a new bank record.
 *
 * Mirrors the legacy Admin BankController::actionCreate().
 * - Creates a bank with name, IBAN, swift code, address, transfer type
 * - Returns { operation, message } on success or error
 */
export async function createBank(
  params: CreateBankParams,
): Promise<CreateBankResult> {
  await requireCapability("bank.write");

  const parsed = createBankSchema.safeParse(params);
  if (!parsed.success) {
    return {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid bank data",
    };
  }

  const { name, ibanCode, swiftCode, address, transferType, codeAbk } =
    parsed.data;

  try {
    await prisma.bank.create({
      data: {
        bank_name: name,
        bank_iban_code: ibanCode,
        bank_swift_code: swiftCode ?? null,
        bank_address: address ?? null,
        bank_transfer_type: transferType ?? null,
        bank_code_abk: codeAbk ?? null,
      },
    });

    return {
      operation: "success",
      message: "Bank created successfully",
    };
  } catch (err) {
    return {
      operation: "error",
      message:
        err instanceof Error ? err.message : "Failed to create bank record",
    };
  }
}
