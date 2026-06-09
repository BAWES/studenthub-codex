"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const listBanksSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

const getBankSchema = z.object({
  id: z.number().int().positive(),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ListBanksParams = z.input<typeof listBanksSchema>;
export type GetBankParams = z.input<typeof getBankSchema>;

export type BankListItem = {
  bank_id: number;
  bank_name: string | null;
  bank_iban_code: string;
  bank_swift_code: string | null;
  bank_code_abk: number | null;
  bank_address: string | null;
  bank_transfer_type: string | null;
};

export type ListBanksResult = {
  banks: BankListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

const createBankSchema = z.object({
  name: z.string().min(1, "Bank name is required"),
  ibanCode: z.string().min(1, "IBAN code is required"),
  swiftCode: z.string().optional(),
  address: z.string().optional(),
  transferType: z.string().optional(),
  codeAbk: z.number().int().optional(),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CreateBankParams = z.input<typeof createBankSchema>;

export type CreateBankResult = {
  operation: string;
  message: string;
};

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

// ---------------------------------------------------------------------------
// createBank
// ---------------------------------------------------------------------------

const createBankSchema = z.object({
  name: z.string().min(1, "Bank name is required"),
  ibanCode: z.string().min(1, "IBAN code is required"),
  swiftCode: z.string().optional(),
  address: z.string().optional(),
  transferType: z.string().optional(),
  codeAbk: z.number().int().optional(),
});

export type CreateBankParams = z.input<typeof createBankSchema>;

export type CreateBankResult = {
  operation: string;
  message: string;
};

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
