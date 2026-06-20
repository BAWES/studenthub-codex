"use server";

// ---------------------------------------------------------------------------
// XeroController — Xero bank transaction server actions
// ---------------------------------------------------------------------------
// Ported from Yii2 admin/modules/v1/controllers/XeroController.php
//
// The Yii2 controller queried bank_transaction records (synced from Xero)
// and provided list/view/sync/download/history actions. This port focuses on
// the read-side data that feeds the admin finance reconciliation UI:
//
//   - listBankTransactions       — paginated list with filters
//   - getBankTransaction         — single transaction detail
//   - getReconciliationStatus    — reconciled vs unreconciled summary
//
// The OAuth2 auth/callback/sync flows that connect to the Xero API are NOT
// part of this port — they belong in a dedicated Xero integration service.
// ---------------------------------------------------------------------------

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import type { Prisma } from "@prisma/client";

// ---------------------------------------------------------------------------
// Import schemas and types from schemas.ts
// ---------------------------------------------------------------------------

import {
  listBankTransactionsSchema,
  getBankTransactionSchema,
  listBankTransactionsResultSchema,
  bankTransactionDetailSchema,
  reconciliationStatusSchema,
  type ListBankTransactionsParams,
  type BankTransactionItem,
  type BankTransactionDetail,
  type ListBankTransactionsResult,
  type ReconciliationStatus,
} from "./schemas";

// ---------------------------------------------------------------------------
// listBankTransactions
// ---------------------------------------------------------------------------

/**
 * List bank transactions with pagination and filters.
 *
 * Mirrors the legacy XeroController actionList() but with richer filtering:
 *  - isReconciled — filter by reconciliation status
 *  - dateFrom / dateTo — date range filter
 *  - contactName — filter by related contact name
 *  - type, status, reference — additional field filters
 *  - Paginated with configurable sort (date, total, created/updated)
 */
export async function listBankTransactions(
  params: ListBankTransactionsParams = {},
): Promise<ListBankTransactionsResult> {
  const {
    isReconciled,
    dateFrom,
    dateTo,
    contactName,
    type,
    status,
    reference,
    sortBy,
    sortDir,
    page,
    limit,
  } = listBankTransactionsSchema.parse(params);

  // Build Prisma where clause
  const where: Prisma.bank_transactionWhereInput = {};

  if (isReconciled !== undefined) {
    where.is_reconciled = isReconciled;
  }

  if (dateFrom !== undefined || dateTo !== undefined) {
    const dateFilter: Prisma.DateTimeFilter = {};
    if (dateFrom) dateFilter.gte = new Date(dateFrom);
    if (dateTo) {
      // Include the full end-of-day
      const endDate = new Date(dateTo);
      endDate.setHours(23, 59, 59, 999);
      dateFilter.lte = endDate;
    }
    where.date = dateFilter;
  }

  if (type !== undefined) {
    where.type = type;
  }

  if (status !== undefined) {
    where.status = status;
  }

  if (reference !== undefined) {
    where.reference = { contains: reference };
  }

  if (contactName !== undefined) {
    where.bank_transaction_contact = {
      name: { contains: contactName },
    };
  }

  // Build orderBy
  const orderByFieldMap: Record<string, string> = {
    date: "date",
    total: "total",
    created_at: "created_at",
    updated_at: "updated_at",
  };
  const orderBy = {
    [orderByFieldMap[sortBy] || "date"]: sortDir,
  };

  const skip = (page - 1) * limit;

  const [rows, total] = await Promise.all([
    prisma.bank_transaction.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        bank_transaction_contact: {
          select: { name: true },
        },
      },
    }),
    prisma.bank_transaction.count({ where }),
  ]);

  const result = {
    transactions: rows.map((row) => ({
      bankTransactionId: row.bank_transaction_id,
      contactId: row.contact_id,
      contactName: row.bank_transaction_contact?.name ?? null,
      reference: row.reference,
      status: row.status,
      type: row.type,
      total: row.total,
      subTotal: row.sub_total,
      totalTax: row.total_tax,
      currencyCode: row.currency_code,
      isReconciled: row.is_reconciled,
      hasAttachments: row.has_attachments,
      date: row.date,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  // Validate output shape
  const outputParsed = listBankTransactionsResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/admin/xero] listBankTransactions output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// getBankTransaction
// ---------------------------------------------------------------------------

/**
 * Get a single bank transaction by ID with full detail including line items.
 *
 * Mirrors the legacy XeroController actionView($id).
 */
export async function getBankTransaction(
  params: z.input<typeof getBankTransactionSchema>,
): Promise<BankTransactionDetail> {
  const { bankTransactionId } = getBankTransactionSchema.parse(params);

  const tx = await prisma.bank_transaction.findUnique({
    where: { bank_transaction_id: bankTransactionId },
    include: {
      bank_transaction_contact: {
        select: { name: true },
      },
      bank_transaction_line_item: true,
    },
  });

  if (!tx) {
    throw new Error(`Bank transaction not found: ${bankTransactionId}`);
  }

  const result = {
    bankTransactionId: tx.bank_transaction_id,
    contactId: tx.contact_id,
    contactName: tx.bank_transaction_contact?.name ?? null,
    reference: tx.reference,
    status: tx.status,
    type: tx.type,
    total: tx.total,
    subTotal: tx.sub_total,
    totalTax: tx.total_tax,
    currencyCode: tx.currency_code,
    currencyRate: tx.currency_rate,
    isReconciled: tx.is_reconciled,
    hasAttachments: tx.has_attachments,
    lineAmountTypes: tx.line_amount_types,
    overpaymentId: tx.overpayment_id,
    prepaymentId: tx.prepayment_id,
    statusAttributeString: tx.status_attribute_string,
    url: tx.url,
    validationErrors: tx.validation_errors,
    date: tx.date,
    createdAt: tx.created_at,
    updatedAt: tx.updated_at,
    lineItems: (tx.bank_transaction_line_item ?? []).map((li) => ({
      lineItemId: li.line_item_id,
      description: li.description,
      accountCode: li.account_code,
      lineAmount: li.line_amount,
      unitAmount: li.unit_amount,
      quantity: li.quantity,
      taxAmount: li.tax_amount,
      taxType: li.tax_type,
    })),
  };

  // Validate output shape
  const outputParsed = bankTransactionDetailSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/admin/xero] getBankTransaction output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// getReconciliationStatus
// ---------------------------------------------------------------------------

/**
 * Get reconciliation status summary: total vs reconciled vs unreconciled.
 *
 * Provides the "view reconciliation status" capability referenced in
 * the legacy XeroController — aggregated statistics rather than raw rows.
 */
export async function getReconciliationStatus(): Promise<ReconciliationStatus> {
  const totalCount = await prisma.bank_transaction.count();
  const reconciledCount = await prisma.bank_transaction.count({
    where: { is_reconciled: true },
  });
  const unreconciledCount = totalCount - reconciledCount;

  const result = {
    totalCount,
    reconciledCount,
    unreconciledCount,
    reconciledPercentage: totalCount > 0
      ? Math.round((reconciledCount / totalCount) * 100)
      : 0,
  };

  // Validate output shape
  const outputParsed = reconciliationStatusSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/admin/xero] getReconciliationStatus output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}
