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
// createBankAccount
// ---------------------------------------------------------------------------

const createBankAccountSchema = z.object({
  name: z.string().min(1, "Bank name is required").max(100),
  swift_code: z.string().max(100).optional(),
  address: z.string().max(100).optional(),
  bank_iban_code: z.string().min(1, "IBAN is required").max(64),
  type: z.string().max(3).optional(),
  bank_code_abk: z.coerce.number().int().optional(),
});

export type CreateBankAccountParams = z.input<typeof createBankAccountSchema>;

export type CreateBankAccountResult = {
  operation: "success" | "error";
  message: string;
};

/**
 * Create a bank account.
 * Mirrors the legacy Yii2 Admin BankController::actionCreate().
 * Requires bank.write capability.
 */
export async function createBankAccount(
  data: CreateBankAccountParams,
): Promise<CreateBankAccountResult> {
  await requireCapability("bank.write");

  const parsed = createBankAccountSchema.safeParse(data);
  if (!parsed.success) {
    return {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid bank data",
    };
  }

  const { name, swift_code, address, bank_iban_code, type, bank_code_abk } =
    parsed.data;

  try {
    await prisma.bank.create({
      data: {
        bank_name: name,
        bank_swift_code: swift_code ?? null,
        bank_address: address ?? null,
        bank_iban_code,
        bank_transfer_type: type ?? null,
        bank_code_abk: bank_code_abk ?? null,
      },
    });

    return {
      operation: "success",
      message: "Bank created successfully",
    };
  } catch (err) {
    return {
      operation: "error",
      message: err instanceof Error ? err.message : "Failed to create bank",
    };
  }
}
